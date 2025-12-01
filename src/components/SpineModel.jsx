import * as THREE from "three";

export class SpineModel {
  constructor(scene) {
    this.scene = scene;
    this.spineSegments = [];
    this.discs = [];
   this.spineGroup = new THREE.Group();
this.spineGroup.position.y = -2.5;

this.scene.add(this.spineGroup);


    this.animationState = {
      currentAngle: 0,
      targetAngle: 0,
      velocity: 0,
      lastUpdate: Date.now(),
    };

    this.createSpine();
    this.createEnvironment();
  }

  createSpine() {
    // More anatomically inspired spine: cervical(7), thoracic(12), lumbar(5) = 24
    const vertebraCount = 24;
    const heights = [];
    let y = 0;

    // Build an S-shaped centerline: lumbar lordosis (forward), thoracic kyphosis (back), cervical lordosis (forward)
    const totalHeight = 24 * 0.28;
    const lumbarHeight = totalHeight * 0.38;
    const thoracicHeight = totalHeight * 0.44;
    const cervicalHeight = totalHeight * 0.18;

    // sample control points for a smooth S curve
    const curvePoints = [
      new THREE.Vector3(0, 0, 0), // base/pelvis
      new THREE.Vector3(0, lumbarHeight * 0.4, -0.15), // lumbar lordosis (forward)
      new THREE.Vector3(0, lumbarHeight + thoracicHeight * 0.35, 0.25), // thoracic kyphosis (back)
      new THREE.Vector3(
        0,
        lumbarHeight + thoracicHeight + cervicalHeight * 0.6,
        -0.08
      ), // cervical lordosis (forward)
      new THREE.Vector3(0, totalHeight, 0),
    ];

    this.curve = new THREE.CatmullRomCurve3(curvePoints);
    this.curve.tension = 0.9;
    this.spineSegments = [];

    for (let i = 0; i < vertebraCount; i++) {
      const progress = i / (vertebraCount - 1);

      // Region based sizes: cervical small, thoracic medium, lumbar large
      let region = "thoracic";
      if (i < 7) region = "cervical";
      else if (i >= 19) region = "lumbar";

      const regionScale =
        region === "cervical" ? 0.6 : region === "thoracic" ? 0.85 : 1.25;
      const bodyRadius = 0.18 * regionScale;
      const bodyHeight = 0.16 * (region === "cervical" ? 0.9 : 1);

      // Create a grouped vertebra (body + spinous + transverse processes)
      const vertebraGroup = new THREE.Group();

      // Vertebral body (more squat cylinder)
      const bodyGeo = new THREE.CylinderGeometry(
        bodyRadius,
        bodyRadius,
        bodyHeight,
        24
      );
      const boneMat = new THREE.MeshStandardMaterial({
        color: 0xe8decf,
        metalness: 0.05,
        roughness: 0.7,
        flatShading: false,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, boneMat);
      bodyMesh.name = "bodyMesh"; // give it a name for debug/lookup
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      bodyMesh.rotation.x = Math.PI / 2; // align front/back axis
      vertebraGroup.add(bodyMesh);

      // Spinous process (posterior small blade)
      const spinousGeo = new THREE.BoxGeometry(
        bodyRadius * 0.4,
        bodyHeight * 1.1,
        bodyRadius * 0.25
      );
      const spinousMesh = new THREE.Mesh(spinousGeo, boneMat.clone());
      spinousMesh.position.set(0, 0, 0.18 + bodyRadius * 0.05); // offset posterior (z)
      spinousMesh.castShadow = true;
      vertebraGroup.add(spinousMesh);

      // Two transverse processes (left/right)
      const transGeo = new THREE.BoxGeometry(
        bodyRadius * 0.25,
        bodyHeight * 0.6,
        bodyRadius * 0.12
      );
      const transLeft = new THREE.Mesh(transGeo, boneMat.clone());
      const transRight = transLeft.clone();
      transLeft.position.set(-bodyRadius - 0.03, 0, 0);
      transRight.position.set(bodyRadius + 0.03, 0, 0);
      transLeft.rotation.z = 0.15;
      transRight.rotation.z = -0.15;
      vertebraGroup.add(transLeft, transRight);

      // Slight anatomical taper and tilt depending on region
      if (region === "thoracic") vertebraGroup.scale.set(1, 1.02, 1);
      if (region === "cervical") vertebraGroup.scale.set(0.9, 0.95, 0.9);
      if (region === "lumbar") vertebraGroup.scale.set(1.15, 1.05, 1.15);

      // Position vertebra along the curve
      const point = this.curve.getPoint(progress);
      vertebraGroup.position.copy(point);

      // Orient each vertebra tangent to the curve
      const tangent = this.curve.getTangent(progress).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, tangent);
      vertebraGroup.quaternion.copy(quaternion);

      // Add to scene and list
      this.spineGroup.add(vertebraGroup);

      this.spineSegments.push({
        mesh: vertebraGroup,
        bodyMesh: bodyMesh, // <-- add direct reference to the mesh
        basePosition: point.clone(),
        progress,
        region,
        baseRotation: vertebraGroup.quaternion.clone(),
      });
    }

    // Intervertebral discs
    this.createIntervertebralDiscs();

    // Smooth spinal cord tube (replace scattered nerve lines)
    this.createSpinalCord();
  }

  createIntervertebralDiscs() {
    // Create flattened discs between vertebrae with region-specific thickness
    this.discs = [];
    for (let i = 0; i < this.spineSegments.length - 1; i++) {
      const segA = this.spineSegments[i];
      const segB = this.spineSegments[i + 1];
      const progress = (segA.progress + segB.progress) / 2;

      // thickness and radius vary slightly by region
      const region = segA.region;
      const radiusFactor =
        region === "cervical" ? 0.65 : region === "thoracic" ? 0.9 : 1.15;
      const discRadius = 0.2 * radiusFactor;
      const discThickness = region === "lumbar" ? 0.08 : 0.06;

      const discGeo = new THREE.CylinderGeometry(
        discRadius,
        discRadius,
        discThickness,
        20
      );
      const discMat = new THREE.MeshStandardMaterial({
        color: 0xc8d8e8,
        metalness: 0.02,
        roughness: 0.8,
        transparent: true,
        opacity: 0.95,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.castShadow = false;

      // position between vertebrae
      const pos = new THREE.Vector3().lerpVectors(
        segA.basePosition,
        segB.basePosition,
        0.5
      );
      disc.position.copy(pos);
      disc.position.y += 0.02; // small lift to sit between bodies

      // align to slope between vertebrae
      const tangent = this.curve.getTangent(progress).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(up, tangent);
      disc.quaternion.copy(q);

      this.spineGroup.add(disc);
      this.discs.push(disc);
    }
  }

  createSpinalCord() {
    // Create a smooth tubular spinal cord following the centerline
    // sample many points along curve
    const samples = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const p = this.curve.getPoint(t);
      // offset slightly anterior to sit in canal
      p.z -= 0.02;
      samples.push(p);
    }
    const spineSpline = new THREE.CatmullRomCurve3(samples);
    const tubeGeo = new THREE.TubeGeometry(spineSpline, 200, 0.06, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x0099cc,
      emissive: 0x002233,
      transparent: true,
      opacity: 0.8,
      roughness: 0.4,
      metalness: 0.1,
    });
    this.spinalCord = new THREE.Mesh(tubeGeo, tubeMat);
    this.spinalCord.castShadow = false;
    this.spineGroup.add(this.spinalCord);
  }

  createEnvironment() {
    // Add a subtle floor reflection
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a0e27,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });

    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -2;
    this.scene.add(this.floor);
  }

  update(data, deltaTime = 16) {
    const dt = Math.min(deltaTime / 1000, 0.1); // Convert to seconds, clamp

    // Smooth spring physics for angle transition
    const targetAngle = (data.angle * Math.PI) / 180;
    const springForce = (targetAngle - this.animationState.currentAngle) * 15;
    const dampingForce = -this.animationState.velocity * 8;

    this.animationState.velocity += (springForce + dampingForce) * dt;
    this.animationState.currentAngle += this.animationState.velocity * dt;

    this.updateSpineSegments(data, dt);
    this.updateMaterials(data);
    this.updateNerveSystem(data);
  }

  updateSpineSegments(data, dt) {
    const bendAngle = this.animationState.currentAngle;
    const time = Date.now() * 0.001;

    this.spineSegments.forEach((segment, index) => {
      const influence = Math.pow(segment.progress, 1.6);
      const segmentBend =
        bendAngle * influence * (segment.region === "cervical" ? 0.6 : 1);

      // compute curve offset for a more anatomical flexion (rotate around local x)
      const curveOffset = new THREE.Vector3(
        Math.sin(segment.progress * Math.PI * 1.5) * segmentBend * 0.18,
        0,
        segmentBend * 0.6
      );

      const targetPosition = segment.basePosition.clone().add(curveOffset);
      segment.mesh.position.lerp(targetPosition, dt * 8);

      // orient group to follow local curvature: look at next segment
      if (index < this.spineSegments.length - 1) {
        const next = this.spineSegments[index + 1];
        const dir = new THREE.Vector3()
          .subVectors(next.mesh.position, segment.mesh.position)
          .normalize();
        const lookPos = segment.mesh.position.clone().add(dir);
        segment.mesh.lookAt(lookPos);
      }

      // breathing/micro movement applied to the group
      const breath = 1 + Math.sin(time * 1.8 + index * 0.4) * 0.01;
      segment.mesh.scale.set(breath, 1, breath);

      // slight lateral micro-movements
      const micro = Math.sin(time * 2.5 + index) * 0.01 * influence;
      segment.mesh.position.x += micro;
    });

    // discs follow vertebrae
    this.discs.forEach((disc, i) => {
      const s1 = this.spineSegments[i];
      const s2 = this.spineSegments[i + 1];
      if (s1 && s2) {
        disc.position.lerpVectors(s1.mesh.position, s2.mesh.position, 0.5);
      }
    });

    // update spinal cord to follow deformed curve by sampling current vertebra positions
    if (
      this.spinalCord &&
      this.spinalCord.geometry &&
      this.spineSegments.length
    ) {
      const cordPoints = [];
      for (let i = 0; i < this.spineSegments.length; i++) {
        const p = this.spineSegments[i].mesh.position.clone();
        p.z -= 0.02; // keep cord slightly anterior inside canal
        cordPoints.push(p);
      }
      // rebuild a simple smooth path (low cost)
      const smooth = new THREE.CatmullRomCurve3(cordPoints);
      const newGeo = new THREE.TubeGeometry(smooth, 120, 0.06, 8, false);
      // dispose old geometry safely
      this.spinalCord.geometry.dispose();
      this.spinalCord.geometry = newGeo;
    }
  }

  updateMaterials(data) {
    const zoneInfo = this.getZoneInfo(data.pwm);
    const alertIntensity = data.pwm > 0 ? 0.4 + (data.pwm / 255) * 0.6 : 0.1;
    const time = Date.now() * 0.001;

    // Update vertebrae materials
    this.spineSegments.forEach((segment, index) => {
      // Safely get the material from the stored bodyMesh (groups don't have .material)
      const bodyMesh = segment.bodyMesh;
      if (!bodyMesh || !bodyMesh.material) return;
      const material = bodyMesh.material;

      // keep previous influence calculation
      const segmentInfluence = Math.pow(segment.progress, 0.5);

      if (material.emissive) {
        // Base color with zone-based modulation
        material.color.lerp(zoneInfo.color, 0.1);
        material.emissive.lerp(zoneInfo.color, 0.1);

        // Alert pulsing effect
        if (data.pwm > 0) {
          const pulse = (Math.sin(time * 4 + index * 0.3) + 1) * 0.5;
          material.emissiveIntensity = alertIntensity * (0.7 + pulse * 0.3);

          // Subtle color shift during alerts
          const alertColor = new THREE.Color().setHSL(
            zoneInfo.hue,
            0.9,
            0.5 + pulse * 0.2
          );
          material.emissive.lerp(alertColor, pulse * 0.3);
        } else {
          material.emissiveIntensity = alertIntensity;
        }
      }
    });

    // Update disc materials (unchanged)
    this.discs.forEach((disc, index) => {
      const material = disc.material;
      if (data.pwm > 0) {
        const pulse = (Math.sin(time * 5 + index * 0.4) + 1) * 0.5;
        material.emissiveIntensity = alertIntensity * (0.6 + pulse * 0.4);
      } else {
        material.emissiveIntensity = 0.1;
      }
    });
  }

  updateNerveSystem(data) {
    // replace older line behavior: tune spinal cord emissive pulse
    if (!this.spinalCord) return;
    const time = Date.now() * 0.001;
    const pulse =
      data.pwm > 0
        ? 0.5 + (Math.sin(time * 6) + 1) * 0.25 * (data.pwm / 255)
        : 0.15;
    this.spinalCord.material.emissiveIntensity = pulse;
    this.spinalCord.material.opacity = data.pwm > 0 ? 0.9 : 0.7;
  }

  getZoneInfo(pwm) {
    const zones = {
      0: { color: new THREE.Color(0x00ff88), hue: 0.4, name: "Optimal" },
      80: { color: new THREE.Color(0xffaa00), hue: 0.1, name: "Warning" },
      160: { color: new THREE.Color(0xff6600), hue: 0.05, name: "Alert" },
      255: { color: new THREE.Color(0xff0000), hue: 0.0, name: "Critical" },
    };
    return zones[pwm] || zones[0];
  }

  cleanup() {
    // Clean up nested geometries and materials inside the spineGroup
    this.spineGroup.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m.dispose && m.dispose());
          else obj.material.dispose && obj.material.dispose();
        }
      }
    });

    // remove group from scene
    this.scene.remove(this.spineGroup);
  }
}
