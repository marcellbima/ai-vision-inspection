import { useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [file, setFile]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/inspections/predict", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Inspection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-400">AI Vision Inspection</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{user?.username} ({user?.role})</span>
          <a href="/inspection" className="text-sm text-green-400 hover:underline">Live Inspection</a>
          <a href="/history" className="text-sm text-blue-400 hover:underline">History</a>
          <button onClick={logout} className="text-sm text-red-400 hover:underline">Logout</button>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Image for Inspection</h2>
          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-48 mx-auto rounded" />
            ) : (
              <p className="text-gray-400">Click to upload image</p>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

          {result && (
            <div className={`mt-4 p-4 rounded-lg border ${result.result === "no_defect" ? "bg-green-900/50 border-green-500" : "bg-red-900/50 border-red-500"}`}>
              <p className="text-lg font-bold">{result.result === "no_defect" ? "✅ GO - No Defect" : "❌ NG - Defect Detected"}</p>
              <p className="text-sm text-gray-300 mt-1">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Processing..." : "Run Inspection"}
          </button>
        </div>
      </div>
    </div>
  );
}
