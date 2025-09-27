import { useState } from "react";
import { createReport } from "../lib/api";
import { toast } from "react-hot-toast";

export default function ReportModal({ open, onClose, restroom, onSuccess }) {
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!open || !restroom) return null;

  function onFile(e) {
    setFiles(Array.from(e.target.files || []).slice(0, 3));
  }

  async function submit() {
    setSubmitting(true);
    try {
      await createReport({
        restroomId: restroom._id,
        description: desc,
        files,
      });
      toast.success("Report submitted! Awaiting review.");
      setDesc("");
      setFiles([]);
      onSuccess?.();     // let parent refresh
      onClose?.();
    } catch (e) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg">Report issue — {restroom.name}</h3>

        <div className="mt-3 space-y-3">
          <div className="form-control">
            <label className="label">Description</label>
            <textarea
              className="textarea textarea-bordered"
              rows={4}
              value={desc}
              onChange={(e)=>setDesc(e.target.value)}
              placeholder="Describe what needs cleaning or fixing…"
            />
          </div>

          <div className="form-control">
            <label className="label">Photos (up to 3)</label>
            <input type="file" accept="image/*" multiple onChange={onFile} className="file-input file-input-bordered" />
            {files?.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {files.map((f, i)=>(
                  <span key={i} className="badge badge-outline">{f.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`btn btn-primary ${submitting ? "loading" : ""}`} onClick={submit} disabled={submitting}>
            Submit
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}/>
    </div>
  );
}