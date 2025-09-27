// client/src/pages/Admin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getReports, confirmReport, assignReport, listStaff, createStaff,
  listAllRestrooms, createRestroom, updateRestroom, deleteRestroom
} from "../lib/api";
import { toast } from "react-hot-toast";

const STATUS_LABELS = {
  PENDING_REVIEW: { text: "Unverified", cls: "badge-warning" },
  CONFIRMED: { text: "Confirmed", cls: "badge-warning" },
  IN_PROGRESS: { text: "In cleaning", cls: "badge-error" },
  RESOLVED: { text: "Resolved", cls: "badge-success" },
};

// Base URL to load image files from server
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function RestroomRow({ r, onSave, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: r.name || "",
    address: r.address || "",
    description: r.description || "",
    lat: r.location?.coordinates?.[1] ?? "",
    lng: r.location?.coordinates?.[0] ?? "",
    wheelchairAccessible: !!r.wheelchairAccessible,
    waterAvailable: !!r.waterAvailable,
    gender: r.gender || "unisex",
  });

  return (
    <tr>
      <td className="align-top">
        {edit ? (
          <input
            className="input input-sm input-bordered w-full"
            value={form.name}
            onChange={(e)=>setForm({...form, name: e.target.value})}
          />
        ) : <div className="font-medium">{r.name}</div>}
        <div className="text-xs opacity-70">{r._id}</div>
      </td>
      <td className="align-top">
        {edit ? (
          <>
            <input
              className="input input-sm input-bordered w-full mb-2"
              placeholder="Address"
              value={form.address}
              onChange={(e)=>setForm({...form, address: e.target.value})}
            />
            <textarea
              className="textarea textarea-bordered textarea-sm w-full"
              rows={2}
              placeholder="Description"
              value={form.description}
              onChange={(e)=>setForm({...form, description: e.target.value})}
            />
          </>
        ) : (
          <>
            <div className="text-sm">{r.address}</div>
            <div className="text-xs opacity-70">{r.description}</div>
          </>
        )}
      </td>
      <td className="align-top">
        {edit ? (
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input input-sm input-bordered"
              placeholder="Lat"
              value={form.lat}
              onChange={(e)=>setForm({...form, lat: e.target.value})}
            />
            <input
              className="input input-sm input-bordered"
              placeholder="Lng"
              value={form.lng}
              onChange={(e)=>setForm({...form, lng: e.target.value})}
            />
            <label className="label cursor-pointer col-span-2">
              <span className="label-text">Wheelchair</span>
              <input
                type="checkbox"
                className="toggle"
                checked={form.wheelchairAccessible}
                onChange={(e)=>setForm({...form, wheelchairAccessible: e.target.checked})}
              />
            </label>
            <label className="label cursor-pointer col-span-2">
              <span className="label-text">Water</span>
              <input
                type="checkbox"
                className="toggle"
                checked={form.waterAvailable}
                onChange={(e)=>setForm({...form, waterAvailable: e.target.checked})}
              />
            </label>
            <select
              className="select select-sm select-bordered col-span-2"
              value={form.gender}
              onChange={(e)=>setForm({...form, gender: e.target.value})}
            >
              <option value="unisex">Unisex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        ) : (
          <div className="text-xs flex gap-2 flex-wrap">
            <span className="badge">Gender: {r.gender}</span>
            <span className={`badge ${r.wheelchairAccessible ? "badge-success" : "badge-ghost"}`}>
              {r.wheelchairAccessible ? "Wheelchair" : "No wheelchair"}
            </span>
            <span className={`badge ${r.waterAvailable ? "badge-success" : "badge-ghost"}`}>
              {r.waterAvailable ? "Water" : "No water"}
            </span>
          </div>
        )}
      </td>
      <td className="align-top text-right">
        {edit ? (
          <>
            <button className="btn btn-sm mr-2" onClick={() => { onSave(r._id, form); setEdit(false); }}>
              Save
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setEdit(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-sm mr-2" onClick={() => setEdit(true)}>Edit</button>
            <button className="btn btn-sm btn-error" onClick={() => onDelete(r._id)}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("reports"); // "reports" | "restrooms"

  // Staff creation
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "" });

  // Reports
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW");
  const [reports, setReports] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Restrooms
  const [restrooms, setRestrooms] = useState([]);
  const [loadingRestrooms, setLoadingRestrooms] = useState(false);
  const [newR, setNewR] = useState({
    name: "", address: "", description: "", lat: "", lng: "",
    wheelchairAccessible: false, waterAvailable: true, gender: "unisex",
  });

  const curLabel = useMemo(() => {
    return STATUS_LABELS[statusFilter] || { text: statusFilter, cls: "" };
  }, [statusFilter]);

  async function loadReports() {
    setLoadingReports(true);
    try {
      const res = await getReports({ status: statusFilter });
      setReports(res.items || []);
    } catch (e) {
      toast.error(e.message || "Failed to load reports");
    } finally { setLoadingReports(false); }
  }

  async function loadStaffList() {
    try {
      const res = await listStaff();
      setStaff(res.users || []);
    } catch {/* ignore */}
  }

  async function loadRestroomsAll() {
    setLoadingRestrooms(true);
    try {
      const res = await listAllRestrooms();
      setRestrooms(res.items || res || []);
    } catch (e) {
      toast.error(e.message || "Failed to load restrooms");
    } finally { setLoadingRestrooms(false); }
  }

  useEffect(() => { if (tab === "reports") loadReports(); }, [statusFilter, tab]);
  useEffect(() => { if (tab === "reports") loadStaffList(); }, [tab]);
  useEffect(() => { if (tab === "restrooms") loadRestroomsAll(); }, [tab]);

  async function onConfirm(id, assignedTo) {
    try {
      await confirmReport(id, assignedTo || undefined);
      toast.success("Report confirmed");
      loadReports();
    } catch (e) {
      toast.error(e.message || "Failed");
    }
  }

  async function onAssign(id, assignedTo) {
    try {
      await assignReport(id, assignedTo ?? null);
      toast.success("Assignment updated");
      loadReports();
    } catch (e) {
      toast.error(e.message || "Failed");
    }
  }

  async function onCreateRestroom() {
    try {
      const body = { ...newR, lat: Number(newR.lat), lng: Number(newR.lng) };
      await createRestroom(body);
      toast.success("Restroom created");
      setNewR({ name: "", address: "", description: "", lat: "", lng: "", wheelchairAccessible: false, waterAvailable: true, gender: "unisex" });
      loadRestroomsAll();
    } catch (e) {
      toast.error(e.message || "Create failed");
    }
  }

  async function onSaveRestroom(id, form) {
    try {
      const body = { ...form, lat: Number(form.lat), lng: Number(form.lng) };
      await updateRestroom(id, body);
      toast.success("Restroom updated");
      loadRestroomsAll();
    } catch (e) {
      toast.error(e.message || "Update failed");
    }
  }

  async function onDeleteRestroom(id) {
    try {
      await deleteRestroom(id);
      toast.success("Restroom deleted");
      loadRestroomsAll();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  }

  async function onCreateStaff() {
    try {
      await createStaff(staffForm);
      setStaffForm({ name: "", email: "", password: "" });
      await loadStaffList();
      toast.success("Staff user created");
    } catch (e) {
      toast.error(e.message || "Failed to create staff");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Create staff account */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <h2 className="card-title">Create Staff Account</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              className="input input-bordered"
              placeholder="Full name"
              value={staffForm.name}
              onChange={(e)=>setStaffForm({...staffForm, name: e.target.value})}
            />
            <input
              className="input input-bordered"
              placeholder="Email"
              type="email"
              value={staffForm.email}
              onChange={(e)=>setStaffForm({...staffForm, email: e.target.value})}
            />
            <input
              className="input input-bordered"
              placeholder="Temporary password"
              type="password"
              value={staffForm.password}
              onChange={(e)=>setStaffForm({...staffForm, password: e.target.value})}
            />
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={onCreateStaff}>Create Staff</button>
          </div>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered mb-4">
        <button role="tab" className={`tab ${tab === "reports" ? "tab-active" : ""}`} onClick={()=>setTab("reports")}>Reports</button>
        <button role="tab" className={`tab ${tab === "restrooms" ? "tab-active" : ""}`} onClick={()=>setTab("restrooms")}>Restrooms</button>
      </div>

      {tab === "reports" && (
        <>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm opacity-70">Filter:</span>
            <select
              className="select select-sm select-bordered"
              value={statusFilter}
              onChange={(e)=>setStatusFilter(e.target.value)}
            >
              <option value="PENDING_REVIEW">Unverified</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In cleaning</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <span className={`badge ${curLabel.cls}`}>{curLabel.text}</span>
          </div>

          {loadingReports ? (
            <div>Loading…</div>
          ) : reports.length === 0 ? (
            <div className="alert">Nothing to show.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Restroom</th>
                    <th>Photos</th>
                    <th>Status</th>
                    <th>Reporter</th>
                    <th className="min-w-[220px]">Assign</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => {
                    const badge = STATUS_LABELS[r.status] || { text: r.status, cls: "" };
                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="font-medium">{r.restroom?.name}</div>
                          <div className="text-xs opacity-70">{r.restroom?.address}</div>
                          <div className="text-xs mt-1 line-clamp-2">{r.description}</div>
                        </td>

                        {/* NEW: Photos column */}
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
                        <td className="text-xs">
                          <div>{r.createdBy?.name}</div>
                          <div className="opacity-70">{r.createdBy?.email}</div>
                        </td>
                        <td>
                          <select
                            className="select select-sm select-bordered w-full"
                            value={r.assignedTo?._id || ""}
                            onChange={(e)=>onAssign(r._id, e.target.value || null)}
                          >
                            <option value="">Unassigned</option>
                            {(staff || []).map(s => (
                              <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                            ))}
                          </select>
                        </td>
                        <td className="text-right">
                          {r.status === "PENDING_REVIEW" && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => onConfirm(r._id, r.assignedTo?._id)}
                            >
                              Confirm
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "restrooms" && (
        <>
          <div className="card bg-base-100 shadow mb-4">
            <div className="card-body">
              <h2 className="card-title">Add restroom</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="input input-bordered"
                  placeholder="Name"
                  value={newR.name}
                  onChange={e=>setNewR({...newR, name: e.target.value})}
                />
                <input
                  className="input input-bordered"
                  placeholder="Address"
                  value={newR.address}
                  onChange={e=>setNewR({...newR, address: e.target.value})}
                />
                <input
                  className="input input-bordered"
                  placeholder="Latitude"
                  value={newR.lat}
                  onChange={e=>setNewR({...newR, lat: e.target.value})}
                />
                <input
                  className="input input-bordered"
                  placeholder="Longitude"
                  value={newR.lng}
                  onChange={e=>setNewR({...newR, lng: e.target.value})}
                />
                <textarea
                  className="textarea textarea-bordered sm:col-span-2"
                  rows={2}
                  placeholder="Description"
                  value={newR.description}
                  onChange={e=>setNewR({...newR, description: e.target.value})}
                />
                <label className="label cursor-pointer">
                  <span className="label-text">Wheelchair accessible</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={newR.wheelchairAccessible}
                    onChange={e=>setNewR({...newR, wheelchairAccessible: e.target.checked})}
                  />
                </label>
                <label className="label cursor-pointer">
                  <span className="label-text">Water available</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={newR.waterAvailable}
                    onChange={e=>setNewR({...newR, waterAvailable: e.target.checked})}
                  />
                </label>
                <select
                  className="select select-bordered"
                  value={newR.gender}
                  onChange={e=>setNewR({...newR, gender: e.target.value})}
                >
                  <option value="unisex">Unisex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={onCreateRestroom}>Create</button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingRestrooms ? (
              <div>Loading…</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address / Description</th>
                    <th>Details</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(restrooms || []).map(r => (
                    <RestroomRow
                      key={r._id}
                      r={r}
                      onSave={onSaveRestroom}
                      onDelete={onDeleteRestroom}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}