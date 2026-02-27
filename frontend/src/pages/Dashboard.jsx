import { useState, useRef } from "react";
import { inspectionAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user, logout }      = useAuth();
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const inputRef              = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const res = await inspectionAPI.predict(file);
      setResult(res.data);
    } catch {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDefect = result?.result === "defect";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-primary">AI Vision Inspection</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.username} ({user?.role})</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Image for Inspection</h2>

          <div
            onClick={() => inputRef.current.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-64 mx-auto rounded" />
            ) : (
              <p className="text-gray-400">Click to upload image</p>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            onClick={handlePredict}
            disabled={!file || loading}
            className="mt-4 w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Run Inspection"}
          </button>
        </div>

        {/* Result Card */}
        {result && (
          <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${isDefect ? "border-red-500" : "border-green-500"}`}>
            <h2 className="text-lg font-semibold mb-4">Inspection Result</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-xl font-bold ${isDefect ? "text-red-600" : "text-green-600"}`}>
                  {isDefect ? "⚠ DEFECT DETECTED" : "✓ NO DEFECT"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="text-xl font-bold">{(result.confidence * 100).toFixed(1)}%</p>
              </div>
              {result.defect_type && (
                <div>
                  <p className="text-sm text-gray-500">Defect Type</p>
                  <p className="font-medium">{result.defect_type}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
