import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { setupScene, cleanupScene } from "./SceneSetup.jsx";
import { SpineModel } from "./SpineModel.jsx";
import { StatsPanel } from "./StatsPanel.jsx";
import { ConnectionSetup } from "./ConnectionSetup.jsx";
import { Header } from "./Header.jsx";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { useEsp32Data } from "../hooks/useEsp32Data";
import { ethers } from "ethers";

const TOKEN_ADDRESS = "0x1c5C681bACA92Ebe073d4EEB0Cbc43017d082516"; // Sepolia contract
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function mint(address to, uint256 amount) external",
];

const SEPOLIA_PARAMS = {
  chainId: "0xaa36a7",
  chainName: "Ethereum Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

export default function PostureMonitor() {
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [espIP, setEspIP] = useState("10.89.144.104");
  const [loadingScene, setLoadingScene] = useState(false);
  const { data, connected, error } = useEsp32Data(espIP, isConfiguring);

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [txPending, setTxPending] = useState(false);
  const [web3Err, setWeb3Err] = useState("");

  const [goodSeconds, setGoodSeconds] = useState(0);
  const GOOD_THRESHOLD_DEG = 10;

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const spineModelRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // --- Scene setup ---
  useEffect(() => {
    if (!mountRef.current || isConfiguring) return;
    let mounted = true;
    let cleanupSceneFn = null;

    const init = async () => {
      setLoadingScene(true);
      try {
        const { scene, camera, renderer, cleanup } = setupScene(
          mountRef.current
        );
        if (!mounted) {
          cleanup && cleanup();
          return;
        }
        sceneRef.current = { scene, camera, renderer };
        cleanupSceneFn = cleanup;

        try {
          spineModelRef.current = new SpineModel(scene);
        } catch (e) {
          console.error("SpineModel init error", e);
        }

        const resizeRenderer = () => {
          if (!mountRef.current || !sceneRef.current) return;
          const width = mountRef.current.clientWidth || 800;
          const height = mountRef.current.clientHeight || 600;
          sceneRef.current.renderer.setSize(width, height, false);
          if (sceneRef.current.camera) {
            sceneRef.current.camera.aspect = width / height;
            sceneRef.current.camera.updateProjectionMatrix();
          }
        };
        resizeRenderer();

        if (typeof ResizeObserver !== "undefined") {
          resizeObserverRef.current = new ResizeObserver(resizeRenderer);
          resizeObserverRef.current.observe(mountRef.current);
        } else {
          window.addEventListener("resize", resizeRenderer);
        }
      } catch (err) {
        console.error("Scene setup failed", err);
      } finally {
        setLoadingScene(false);
      }
    };

    init();

    return () => {
      mounted = false;
      if (resizeObserverRef.current) {
        try {
          resizeObserverRef.current.disconnect();
        } catch {}
        resizeObserverRef.current = null;
      }
      if (spineModelRef.current) {
        try {
          spineModelRef.current.cleanup();
        } catch {}
        spineModelRef.current = null;
      }
      if (cleanupSceneFn) {
        try {
          cleanupSceneFn();
        } catch {}
      }
      if (sceneRef.current?.renderer?.domElement?.parentNode) {
        sceneRef.current.renderer.domElement.parentNode.removeChild(
          sceneRef.current.renderer.domElement
        );
      }
      sceneRef.current = null;
    };
  }, [isConfiguring]);

  // --- Animation Loop ---
  useAnimationFrame(() => {
    if (!spineModelRef.current || !sceneRef.current) return;
    try {
      const angleNum = Number(data?.angle ?? 0);
      spineModelRef.current.update({ ...data, angle: angleNum });
    } catch (e) {
      console.error("Render/update error", e);
    }
    sceneRef.current.renderer.render(
      sceneRef.current.scene,
      sceneRef.current.camera
    );
  }, [data]);

  // --- Posture logic (rewards & penalties) ---
  useEffect(() => {
    const id = setInterval(() => {
      const a = Number(data?.angle ?? 0);
      if (!Number.isFinite(a)) return;

      if (Math.abs(a) < GOOD_THRESHOLD_DEG) {
        // Good posture → gain points
        setGoodSeconds((s) => s + 1);
      } else {
        // Bad posture → lose points faster
        setGoodSeconds((s) => Math.max(0, s - 2));
      }
    }, 1000);

    return () => clearInterval(id);
  }, [data]);

  // --- Wallet + Blockchain setup ---
  const ensureSepolia = useCallback(async () => {
    if (!window.ethereum) throw new Error("MetaMask not found");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_PARAMS.chainId }],
      });
    } catch (e) {
      if (e?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [SEPOLIA_PARAMS],
        });
      } else {
        throw e;
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setWeb3Err("");
    if (!window.ethereum) {
      setWeb3Err("Install MetaMask.");
      return;
    }
    try {
      await ensureSepolia();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const acc = accounts?.[0] || "";
      setAddress(acc);
    } catch (e) {
      setWeb3Err(e?.message || "Failed to connect");
    }
  }, [ensureSepolia]);

  const loadBalance = useCallback(async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const bal = await contract.balanceOf(addr);
      setBalance(ethers.formatEther(bal));
    } catch (e) {
      setWeb3Err(e?.reason || e?.message || "Balance read failed");
    }
  }, []);

  useEffect(() => {
    if (address) loadBalance(address);
  }, [address, loadBalance]);

  const mintOneToken = useCallback(async () => {
    setWeb3Err("");
    if (!window.ethereum || !address) return;
    setTxPending(true);
    try {
      await ensureSepolia();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const tx = await contract.mint(address, ethers.parseEther("1"));
      await tx.wait();
      await loadBalance(address);
    } catch (e) {
      setWeb3Err(
        e?.reason || e?.message || "Mint failed (are you contract owner?)"
      );
    } finally {
      setTxPending(false);
    }
  }, [address, ensureSepolia, loadBalance]);

  // --- Derived tokens (frontend only) ---
  const tokensFromScore = Math.floor(goodSeconds / 600);
  const handleConnect = useCallback(() => setIsConfiguring(false), []);

  // --- UI ---
  if (isConfiguring) {
    return (
      <ConnectionSetup
        espIP={espIP}
        setEspIP={setEspIP}
        onConnect={handleConnect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      <Header connected={connected} error={error} />

      <div className="pt-20 px-6 pb-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[70vh]">
          <div className="lg:col-span-2 bg-slate-900/30 backdrop-blur-lg rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl relative">
            <div
              ref={mountRef}
              className="w-full"
              style={{ width: "100%", height: "600px", minHeight: "360px" }}
            />
            {loadingScene && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/60 text-sm text-cyan-300 px-4 py-2 rounded-md">
                  Loading 3D scene…
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-cyan-500/30">
              <div className="text-sm text-cyan-400 font-medium">
                3D Spine Visualization
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <StatsPanel data={data} espIP={espIP} />

            <div className="bg-slate-900/40 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-cyan-300">
                  Blockchain Rewards
                </h3>
                {!address ? (
                  <button
                    onClick={connectWallet}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <span className="text-xs text-cyan-200 break-all">
                    {address}
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="bg-black/30 rounded-lg p-3 border border-cyan-500/20">
                  <div className="text-cyan-400">Good Posture</div>
                  <div className="text-xl font-bold">{goodSeconds}s</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-cyan-500/20">
                  <div className="text-cyan-400">Tokens (score)</div>
                  <div className="text-xl font-bold">{tokensFromScore}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-cyan-500/20">
                  <div className="text-cyan-400">POST Balance</div>
                  <div className="text-xl font-bold">{balance}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={mintOneToken}
                  disabled={!address || txPending}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50"
                >
                  {txPending ? "Minting…" : "Claim 1 POST"}
                </button>
                <button
                  onClick={() => address && loadBalance(address)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-500/30"
                >
                  Refresh Balance
                </button>
              </div>

              {web3Err && (
                <div className="mt-3 text-xs text-red-300">{web3Err}</div>
              )}

              <p className="mt-3 text-xs text-cyan-200/80">
                Demo note: Tokens update from your posture score when you mint
                manually.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 20%, rgba(0, 255, 255, 0.15) 0%, transparent 25%),
              radial-gradient(circle at 90% 80%, rgba(255, 0, 255, 0.15) 0%, transparent 25%),
              radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)
            `,
            filter: "blur(40px)",
          }}
        />
      </div>
    </div>
  );
}
