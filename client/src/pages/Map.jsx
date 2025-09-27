import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { fetchRestrooms, getStatusByRestroom } from "../lib/api";
import ReportModal from "../components/ReportModal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// marker asset fix for Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png?url";
import markerIcon from "leaflet/dist/images/marker-icon.png?url";
import markerShadow from "leaflet/dist/images/marker-shadow.png?url";
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], tooltipAnchor: [16, -28], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center); }, [center, map]);
  return null;
}

const STATUS_LABELS = {
  PENDING_REVIEW: { text: "Unverified report", cls: "badge-warning" },
  CONFIRMED: { text: "Issue confirmed", cls: "badge-warning" },
  IN_PROGRESS: { text: "Under cleaning", cls: "badge-error" },
  RESOLVED: { text: "Cleaned", cls: "badge-success" },
};

export default function MapPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [center, setCenter] = useState([6.9271, 79.8612]); // [lat,lng] — Colombo
  const [radius, setRadius] = useState(5);
  const [wheelchair, setWheelchair] = useState("");
  const [water, setWater] = useState("");
  const [gender, setGender] = useState("");
  const [items, setItems] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // restroomId -> status
  const [loading, setLoading] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [selectedRestroom, setSelectedRestroom] = useState(null);

  const query = useMemo(() => {
    const q = { lat: center[0], lng: center[1], radius };
    if (wheelchair) q.wheelchair = wheelchair;
    if (water) q.water = water;
    if (gender) q.gender = gender;
    return q;
  }, [center, radius, wheelchair, water, gender]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchRestrooms(query);
      setItems(res.items || []);
    } finally { setLoading(false); }
  }

  // fetch restrooms on query change
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [JSON.stringify(query)]);

  // after items load, fetch statuses for these restroom ids
  useEffect(() => {
    (async () => {
      if (!items?.length) { setStatusMap({}); return; }
      const ids = items.map(i => i._id);
      try {
        const res = await getStatusByRestroom(ids);
        const map = {};
        for (const row of res.items || []) map[row.restroomId] = row.status;
        setStatusMap(map);
      } catch (e) {
        console.warn("status fetch failed", e);
      }
    })();
  }, [items]);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn(err),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function openReport(restroom) {
    if (!user) {
      // must login to report
      nav("/login");
      return;
    }
    setSelectedRestroom(restroom);
    setReportOpen(true);
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <div className="p-3 bg-base-200 border-b flex flex-wrap gap-3 items-center">
        <button className="btn btn-sm" onClick={useMyLocation}>Use my location</button>

        <label className="form-control w-40">
          <div className="label"><span className="label-text">Radius (km)</span></div>
          <input type="range" min="1" max="15" value={radius}
                 onChange={(e)=>setRadius(Number(e.target.value))}
                 className="range" />
          <div className="text-xs opacity-70 mt-1">{radius} km</div>
        </label>

        <select className="select select-sm select-bordered" value={wheelchair}
                onChange={(e)=>setWheelchair(e.target.value)}>
          <option value="">Wheelchair: any</option>
          <option value="true">Accessible</option>
          <option value="false">Not accessible</option>
        </select>

        <select className="select select-sm select-bordered" value={water}
                onChange={(e)=>setWater(e.target.value)}>
          <option value="">Water: any</option>
          <option value="true">Available</option>
          <option value="false">Not available</option>
        </select>

        <select className="select select-sm select-bordered" value={gender}
                onChange={(e)=>setGender(e.target.value)}>
          <option value="">Gender: any</option>
          <option value="unisex">Unisex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button className={`btn btn-sm ${loading ? "loading" : ""}`} onClick={load}>
          Refresh
        </button>
      </div>

      <div className="flex-1">
        <MapContainer center={center} zoom={14} scrollWheelZoom className="w-full h-full">
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter center={center} />

          {items.map((r) => {
            const status = statusMap[r._id];
            const badge = status ? STATUS_LABELS[status] : null;

            return (
              <Marker key={r._id} position={[r.location.coordinates[1], r.location.coordinates[0]]}>
                <Popup>
                  <div className="space-y-2">
                    <div className="font-semibold text-base">{r.name}</div>
                    {r.address && <div className="text-xs opacity-70">{r.address}</div>}
                    {r.description && <div className="text-sm">{r.description}</div>}

                    <div className="text-xs flex gap-2 flex-wrap">
                      <span className="badge">Gender: {r.gender}</span>
                      <span className={`badge ${r.wheelchairAccessible ? "badge-success" : "badge-ghost"}`}>
                        {r.wheelchairAccessible ? "Wheelchair OK" : "No wheelchair"}
                      </span>
                      <span className={`badge ${r.waterAvailable ? "badge-success" : "badge-ghost"}`}>
                        {r.waterAvailable ? "Water" : "No water"}
                      </span>
                      {badge && <span className={`badge ${badge.cls}`}>{badge.text}</span>}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button className="btn btn-sm btn-primary" onClick={() => openReport(r)}>
                        Report issue
                      </button>
                      {status === "IN_PROGRESS" && (
                        <span className="badge badge-error">Temporarily closed for cleaning</span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        restroom={selectedRestroom}
        onSuccess={() => {
          // reload statuses so popup updates to PENDING_REVIEW
          if (items?.length) {
            getStatusByRestroom(items.map(i=>i._id))
              .then(res => {
                const map = {};
                for (const row of res.items || []) map[row.restroomId] = row.status;
                setStatusMap(map);
              })
              .catch(()=>{});
          }
        }}
      />
    </div>
  );
}