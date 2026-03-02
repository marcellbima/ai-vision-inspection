import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function History() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/inspections/history")
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-400">AI Vision Inspection</h1>
        <div className="flex items-center gap-4">
          <a href="/inspection" className="text-sm text-green-400 hover:underline">Live Inspection</a>
          <a href="/dashboard" className="text-sm text-blue-400 hover:underline">Dashboard</a>
          <button onClick={logout} className="text-sm text-red-400 hover:underline">Logout</button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-lg font-semibold mb-4">Inspection History</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-400">No inspection history yet.</p>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Result</th>
                  <th className="px-4 py-3 text-left">Confidence</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.result === "no_defect" ? "bg-green-800 text-green-300" : "bg-red-800 text-red-300"}`}>
                        {item.result === "no_defect" ? "GO" : "NG"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{(item.confidence * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(item.created_at).toLocaleString()}</td>
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
