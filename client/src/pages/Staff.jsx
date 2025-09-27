// client/src/pages/Staff.jsx
import { useEffect, useState } from "react";
import { getReports, startReport, resolveReport } from "../lib/api";
import { toast } from "react-hot-toast";

const LABEL = {
  PENDING_REVIEW: { text: "Unverified", cls: "badge-warning" },
  CONFIRMED: { text: "Confirmed", cls: "badge-warning" },
  IN_PROGRESS: { text: "In cleaning", cls: "badge-error" },
  RESOLVED: { text: "Resolved", cls: "badge-success" },
};

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Staff() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      // fetch only my assignments
      const res = await getReports({ mine: "true" });
      setItems(res.items || []);
    } catch (e) {
      toast.error(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onStart(id) {
    try {
      await startReport(id);
      toast.success("Marked as in cleaning");
      load();
    } catch (e) {
      toast.error(e.message || "Failed");
    }
  }

  async function onResolve(id) {
    try {
      await resolveReport(id);
      toast.success("Marked as resolved");
      load();
    } catch (e) {
      toast.error(e.message || "Failed");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Tasks</h1>

      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div className="alert">No assignments yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Restroom</th>
                <th>Photos</th>
                <th>Status</th>
                <th>Description</th>
                <th>Reported</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const badge = LABEL[r.status] || { text: r.status, cls: "" };
                return (
                  <tr key={r._id}>
                    <td>
                      <div className="font-medium">{r.restroom?.name || "-"}</div>
                      <div className="text-xs opacity-70">{r.restroom?.address}</div>
                    </td>
                    <td>
                      {r.photos?.length ? (
                        <div className="flex gap-2 flex-wrap">
                          {r.photos.map((p, i) => {
                            const src = `${BASE}/uploads/${p}`;
                            return (
                              <a key={i} href={src} target="_blank" rel="noreferrer">
                                <img
                                  src={src}
                                  alt="report"
                                  className="h-14 w-14 object-cover rounded border"
                                  loading="lazy"
                                />
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs opacity-50">No photos</span>
                      )}
                    </td>
                    <td><span className={`badge ${badge.cls}`}>{badge.text}</span></td>
                    <td className="max-w-[320px]">
                      <div className="line-clamp-3 text-sm">{r.description}</div>
                    </td>
                    <td className="text-xs opacity-70">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="text-right">
                      {r.status === "CONFIRMED" && (
                        <button className="btn btn-sm btn-primary" onClick={() => onStart(r._id)}>
                          Start cleaning
                        </button>
                      )}
                      {r.status === "IN_PROGRESS" && (
                        <button className="btn btn-sm btn-success" onClick={() => onResolve(r._id)}>
                          Mark as completed
                        </button>
                      )}
                      {(r.status === "PENDING_REVIEW" || r.status === "RESOLVED") && (
                        <span className="text-xs opacity-50">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}