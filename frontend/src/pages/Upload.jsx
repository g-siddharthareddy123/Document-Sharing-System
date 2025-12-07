// src/pages/Upload.jsx
import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import "./Upload.css";
import uploadIcon from "../assets/upload.jpeg";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|gif|pdf|docx?|txt)$/i;

export default function UploadPage() {
  const inputRef = useRef();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const validateFile = (f) => {
    if (!f) return "Select a file.";
    if (f.size > MAX_BYTES) return "File too large (max 12MB).";
    if (!ALLOWED_EXTENSIONS.test(f.name)) return "Unsupported file type.";
    return null;
  };

  const handlePick = (f) => {
    setError("");
    setSuccessMsg("");

    const v = validateFile(f);
    if (v) return setError(v);

    setFile(f);

    if (f.type?.startsWith("image/") || f.type === "application/pdf") {
      setPreviewUrl(URL.createObjectURL(f));
      setShowPreviewModal(true);
    } else {
      setPreviewUrl(null);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) handlePick(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handlePick(f);
  };

  const onDragOver = (e) => e.preventDefault();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!title.trim()) return setError("Provide a title.");
    if (!file) return setError("Choose a file.");
    const v = validateFile(file);
    if (v) return setError(v);

    if (!token) return setError("You must be logged in to upload.");

    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    form.append("description", desc);
    form.append("authorEmail", user?.email);

    try {
      setBusy(true);
      const res = await api.post("/uploads", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (ev) => {
          if (ev.total)
            setProgress(Math.round((ev.loaded * 100) / ev.total));
        },
      });

      console.log("Upload response:", res.data);

      // ✅ Clear form
      setSuccessMsg("Uploaded successfully.");
      toast.success("Document uploaded successfully ✅");
      setTitle("");
      setDesc("");
      setFile(null);
      setPreviewUrl(null);
      if (inputRef.current) inputRef.current.value = null;

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      const m =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Upload failed";
      setError(String(m));
      toast.error(String(m));
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setFile(null);
    setPreviewUrl(null);
    setError("");
    setSuccessMsg("");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = null;
  };

  return (
    <div className="upload-page card p-4">
      {/* ✅ Loading overlay when uploading */}
      {busy && (
        <div className="upload-loading-overlay">
          <div className="spinner-border text-primary" role="status" />
          <div className="upload-loading-text">Uploading...</div>
        </div>
      )}

      {/* Header with small right icon */}
      <div className="upload-header">
        <div>
          <h4>Upload Document</h4>
          {user && (
            <p className="text-muted mb-2">
              Author : <strong>{user.name}</strong>
            </p>
          )}
        </div>
        <img src={uploadIcon} alt="Upload" className="upload-icon" />
      </div>

      <form onSubmit={submit}>
        {/* Title from user */}
        <div className="mb-2">
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-2">
          <textarea
            className="form-control"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            rows={3}
          />
        </div>

        {/* Dropzone */}
        <div
          className="dropzone mb-2 p-4 text-center"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => inputRef.current?.click()}
        >
          <div className="fw-semibold">
            Drag &amp; drop file or click to browse
          </div>
          <div className="text-muted small">
            Allowed: jpg, png, gif, pdf, doc, docx, txt — up to 12MB
          </div>
          {file && (
            <div className="mt-2">
              {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            style={{ display: "none" }}
            onChange={onFile}
          />
        </div>

        {/* Preview button */}
        {previewUrl && (
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm me-2"
              onClick={() => setShowPreviewModal(true)}
            >
              Preview
            </button>
          </div>
        )}

        {/* Errors & success */}
        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && (
          <div className="alert alert-success">{successMsg}</div>
        )}

        {/* Progress bar */}
        {progress > 0 && (
          <div className="mb-2">
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Uploading..." : "Upload"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={resetForm}
            disabled={busy}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="preview-modal">
          <div className="preview-modal-body card p-3">
            <div className="d-flex justify-content-between mb-2">
              <strong>Preview</strong>
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
            {file?.type?.startsWith("image/") && (
              <img
                src={previewUrl}
                alt="preview"
                style={{ maxWidth: "100%" }}
              />
            )}
            {file?.type === "application/pdf" && (
              <iframe
                src={previewUrl}
                style={{ width: "100%", height: "70vh" }}
                title="pdf preview"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
