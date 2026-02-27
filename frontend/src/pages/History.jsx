import { useEffect, useState } from "react";
import { inspectionAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function History() {
  const { user, logout }      = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inspectionAPI.history()
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-primary">Inspection History</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-600">{user?.username}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No inspection records yet.</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Result</th>
                  <th className="px-4 py-3 text-left">Confidence</th>
                  <th className="px-4 py-3 text-left">Defect Type</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${r.result === "defect" ? "text-red-600" : "text-green-600"}`}>
                        {r.result === "defect" ? "⚠ Defect" : "✓ OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{(r.confidence * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3">{r.defect_type || "-"}</td>
                    <td className="px-4 py-3">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
