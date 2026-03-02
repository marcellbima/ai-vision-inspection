import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const WS_PROTOCOL = window.location.protocol === "https:" ? "wss:" : "ws:";
const WS_URL = `${WS_PROTOCOL}//${window.location.host}/ws/inspect`;

export default function Inspection() {
  const { user, logout }          = useAuth();
  const videoRef                  = useRef(null);
  const canvasRef                 = useRef(null);
  const wsRef                     = useRef(null);
  const intervalRef               = useRef(null);
  const [status, setStatus]       = useState(null);   // GO / NG
  const [confidence, setConf]     = useState(null);
  const [connected, setConnected] = useState(false);
  const [source, setSource]       = useState("webcam"); // webcam / video
  const [running, setRunning]     = useState(false);
  const [stats, setStats]         = useState({ go: 0, ng: 0 });

  const connectWS = () => {
    const ws = new WebSocket(WS_URL);
    ws.onopen  = () => { setConnected(true); console.log("WS connected"); };
    ws.onclose = () => { setConnected(false); setRunning(false); };
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "result") {
        setStatus(data.status);
        setConf(data.confidence);
        setStats(prev => ({
          go: prev.go + (data.status === "GO" ? 1 : 0),
          ng: prev.ng + (data.status === "NG" ? 1 : 0),
        }));
      }
    };
    wsRef.current = ws;
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setSource("webcam");
    } catch {
      alert("Cannot access webcam");
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    videoRef.current.srcObject = null;
    videoRef.current.src = URL.createObjectURL(file);
    videoRef.current.play();
    setSource("video");
  };

  const sendFrame = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!videoRef.current || videoRef.current.paused) return;
    const canvas  = canvasRef.current;
    const ctx     = canvas.getContext("2d");
    canvas.width  = 320;
    canvas.height = 240;
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    const base64 = canvas.toDataURL("image/jpeg", 0.7);
    wsRef.current.send(JSON.stringify({ type: "frame", data: base64 }));
  };

  const startInspection = () => {
    if (!connected) connectWS();
    setTimeout(() => {
      intervalRef.current = setInterval(sendFrame, 500); // 2 FPS
      setRunning(true);
    }, 500);
  };

  const stopInspection = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setStatus(null);
  };

  const resetStats = () => setStats({ go: 0, ng: 0 });

  useEffect(() => {
    connectWS();
    return () => {
      clearInterval(intervalRef.current);
      wsRef.current?.close();
    };
  }, []);

  const isGO = status === "GO";
  const isNG = status === "NG";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-400">AI Vision Inspection</h1>
        <div className="flex items-center gap-4">
          <span className={`text-xs px-2 py-1 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}>
            {connected ? "WS Connected" : "WS Disconnected"}
          </span>
          <a href="/dashboard" className="text-sm text-blue-400 hover:underline">Dashboard</a>
          <a href="/history" className="text-sm text-blue-400 hover:underline">History</a>
          <button onClick={logout} className="text-sm text-red-400 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Video Feed */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-md font-semibold mb-3 text-gray-300">Video Feed</h2>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {running && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                ● LIVE
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={startWebcam}
              className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2 rounded-lg">
              📷 Webcam
            </button>
            <label className="bg-purple-600 hover:bg-purple-700 text-sm px-4 py-2 rounded-lg cursor-pointer">
              📁 Upload Video
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            </label>
            {!running ? (
              <button onClick={startInspection}
                className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2 rounded-lg">
                ▶ Start Inspection
              </button>
            ) : (
              <button onClick={stopInspection}
                className="bg-red-600 hover:bg-red-700 text-sm px-4 py-2 rounded-lg">
                ⏹ Stop
              </button>
            )}
          </div>
        </div>

        {/* GO/NG Indicator */}
        <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center">
          <h2 className="text-md font-semibold mb-6 text-gray-300">Inspection Result</h2>

          {/* Big Indicator */}
          <div className={`w-64 h-64 rounded-full flex items-center justify-center text-6xl font-black border-8 transition-all duration-300 ${
            !status    ? "border-gray-600 text-gray-600 bg-gray-700" :
            isGO       ? "border-green-400 text-green-400 bg-green-900 shadow-lg shadow-green-500/50" :
                         "border-red-400 text-red-400 bg-red-900 shadow-lg shadow-red-500/50"
          }`}>
            {!status ? "---" : status}
          </div>

          {/* Confidence */}
          {confidence !== null && (
            <p className="mt-4 text-gray-400 text-sm">
              Confidence: <span className="text-white font-bold">{(confidence * 100).toFixed(1)}%</span>
            </p>
          )}

          {/* Stats */}
          <div className="mt-6 w-full grid grid-cols-2 gap-4">
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 text-center">
              <p className="text-green-400 text-3xl font-black">{stats.go}</p>
              <p className="text-green-300 text-sm mt-1">GO ✅</p>
            </div>
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-center">
              <p className="text-red-400 text-3xl font-black">{stats.ng}</p>
              <p className="text-red-300 text-sm mt-1">NG ❌</p>
            </div>
          </div>

          {/* Total & Reset */}
          <div className="mt-4 w-full flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              Total: <span className="text-white font-bold">{stats.go + stats.ng}</span> inspected
            </p>
            <button onClick={resetStats}
              className="text-xs text-gray-400 hover:text-white border border-gray-600 px-3 py-1 rounded">
              Reset Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
