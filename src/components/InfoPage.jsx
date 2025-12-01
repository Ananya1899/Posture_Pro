
import { Link } from "react-router-dom";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">

        <Link to="/infoscreen" className="text-cyan-300 text-sm underline">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-cyan-400 mt-6 mb-4">
          Understanding Spine & Posture
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          The human spine contains 33 vertebrae arranged to support our body, protect the spinal cord & allow motion.
          Good posture keeps the spine in neutral alignment, reducing stress on discs, muscles and ligaments.
        </p>

        <img
          src="/image.png"
          alt="Spine anatomy"
          className="rounded-xl border border-cyan-500/20 shadow-xl mb-8"
        />

        <h2 className="text-2xl font-semibold text-cyan-300 mb-3">
          Why Posture Matters?
        </h2>

        <ul className="text-gray-300 list-disc ml-6 space-y-2 mb-8">
          <li>Reduces back & neck pain</li>
          <li>Improves breathing capacity</li>
          <li>Prevents abnormal spine curvature</li>
          <li>Lowers stress on spinal discs</li>
        </ul>

        <img
          src="/img1.png"
          alt="correct posture"
          className="rounded-xl border border-cyan-500/20 shadow-xl mb-8"
        />

        <h2 className="text-2xl font-semibold text-cyan-300 mb-3">
          Ideal Sitting Angle?
        </h2>

        <p className="text-gray-300 leading-relaxed mb-10">
          Physiotherapists generally recommend keeping the upper body between 0° to 10° forward tilt while sitting.
          Forward bending above 15° for long durations increases lumbar disc pressure and may cause pain over time.
        </p>

      </div>
    </div>
  );
}
