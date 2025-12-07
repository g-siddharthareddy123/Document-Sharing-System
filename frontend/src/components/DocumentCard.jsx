// src/components/DocumentCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import share from "../assets/share.png";
import "./DocumentCard.css";

const API_BASE = "http://localhost:5000/api";

export default function DocumentCard({
  doc,
  currentUserEmail,
  onShare,          // optional: parent can still react after share
  onEdit,           // optional
  onDelete,         // optional
  onMarkImportant,  // optional
}) {
  const [showShareBox, setShowShareBox] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [marking, setMarking] = useState(false);
  const [sharing, setSharing] = useState(false);

  /* ================= OWNER / SHARE LOGIC ================= */

  const normalizedCurrentEmail = currentUserEmail?.toLowerCase() || "";

  // backend stores email in uploaderName
  const uploaderEmail =
    typeof doc.uploaderName === "string"
      ? doc.uploaderName.toLowerCase()
      : "";

  const isOwner =
    normalizedCurrentEmail &&
    uploaderEmail === normalizedCurrentEmail;

  const isSharedWithUser =
    normalizedCurrentEmail &&
    Array.isArray(doc.sharedWith) &&
    doc.sharedWith
      .map((e) => e?.toLowerCase())
      .includes(normalizedCurrentEmail) &&
    !isOwner;

  /* ================= SHARE HANDLERS (API) ================= */

  const toggleShareBox = () => {
    if (!isOwner) return;
    setShowShareBox((prev) => !prev);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    const email = shareEmail.trim();
    if (!email) return;

    try {
      setSharing(true);

      const res = await fetch(`${API_BASE}/uploads/${doc._id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try {
          const json = JSON.parse(text);
          msg = json.msg || json.error || text;
        } catch (err) {
          // ignore JSON parse error
        }
        alert("Failed to share: " + msg);
        return;
      }

      const data = await res.json(); // { ok, msg, sharedWith }

      // optional: notify parent about new sharedWith list
      onShare?.(doc, email, data.sharedWith);

      alert("Document shared successfully");
      setShareEmail("");

      // simplest: reload to see updated badges
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Share failed: " + (err.message || "Unknown error"));
    } finally {
      setSharing(false);
    }
  };

  const existingEmails = Array.isArray(doc.sharedWith)
    ? doc.sharedWith
    : [];

  /* ================= DELETE HANDLER (API) ================= */

  const handleDeleteClick = async () => {
    if (!isOwner) return;

    const ok = window.confirm(
      `Are you sure you want to delete "${doc.title || doc.filename}"?`
    );
    if (!ok) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API_BASE}/uploads/${doc._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try {
          const json = JSON.parse(text);
          msg = json.msg || json.error || text;
        } catch (e) {}
        alert("Failed to delete: " + msg);
        return;
      }

      // optional: notify parent
      onDelete?.(doc);

      alert("Document deleted successfully");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + (err.message || "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  /* ================= EDIT HANDLER (API) ================= */

  const handleEditClick = async () => {
    if (!isOwner) return;

    const newTitle = window.prompt(
      "Enter new title:",
      doc.title || doc.filename || ""
    );
    if (newTitle === null || !newTitle.trim()) return;

    const newDesc = window.prompt(
      "Enter new description:",
      doc.description || ""
    );
    if (newDesc === null) return;

    try {
      setUpdating(true);

      const res = await fetch(`${API_BASE}/uploads/${doc._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try {
          const json = JSON.parse(text);
          msg = json.msg || json.error || text;
        } catch (e) {}
        alert("Failed to update: " + msg);
        return;
      }

      onEdit?.({ ...doc, title: newTitle.trim(), description: newDesc });

      alert("Document updated successfully");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Update failed: " + (err.message || "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  /* ================= MARK IMPORTANT (API) ================= */

  const handleMarkClick = async () => {
    if (!isOwner) return;

    const newImportant = !doc.isImportant;

    try {
      setMarking(true);

      const res = await fetch(`${API_BASE}/uploads/${doc._id}/important`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isImportant: newImportant }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text;
        try {
          const json = JSON.parse(text);
          msg = json.msg || json.error || text;
        } catch (e) {}
        alert("Failed to update important flag: " + msg);
        return;
      }

      onMarkImportant?.(doc._id, newImportant);

      alert(
        newImportant ? "Marked as important" : "Unmarked as important"
      );
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update: " + (err.message || "Unknown error"));
    } finally {
      setMarking(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="card doc-card h-100 position-relative">
      {/* SHARE ICON */}
      {isOwner && (
        <img
          src={share}
          alt="Share"
          title="Share"
          className="doc-card-share-icon"
          onClick={toggleShareBox}
        />
      )}

      {/* SHARE POPUP */}
      {isOwner && showShareBox && (
        <div className="doc-card-share-popup">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <strong>Share document</strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowShareBox(false)}
            />
          </div>

          {existingEmails.length > 0 && (
            <div className="mb-2">
              <div className="text-muted small mb-1">
                Already shared with:
              </div>
              {existingEmails.map((em, idx) => (
                <span
                  key={idx}
                  className="badge bg-light text-dark me-1 mb-1"
                >
                  {em}
                </span>
              ))}
            </div>
          )}

          <form onSubmit={handleShareSubmit}>
            <input
              type="email"
              className="form-control form-control-sm mb-2"
              placeholder="Enter email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary w-100"
              disabled={sharing}
            >
              {sharing ? "Sharing..." : "Share"}
            </button>
          </form>
        </div>
      )}

      {/* CARD BODY */}
      <div className="card-body d-flex flex-column">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start">
          <h6 className="mb-1 pe-4">
            {doc.title || doc.filename}
          </h6>
          {doc.isImportant && (
            <span className="badge bg-danger">
              Important
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="text-muted small mb-2">
          {isSharedWithUser ? (
            <>
              Shared by:
              <strong className="ms-1">
                {doc.uploaderName || "Unknown"}
              </strong>{" "}
              •{" "}
              {doc.createdAt &&
                new Date(doc.createdAt).toLocaleDateString()}
            </>
          ) : (
            <>
              {doc.uploaderName || "Unknown"} •{" "}
              {doc.createdAt &&
                new Date(doc.createdAt).toLocaleDateString()}
            </>
          )}
        </div>

        {/* Description */}
        <div className="flex-grow-1 mb-2">
          {doc.description || "No description"}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="d-flex justify-content-between align-items-center">
          {/* Left */}
          <div>
            <Link
              to={`/doc/${doc._id}`}
              className="btn btn-sm btn-primary me-2"
            >
              Open
            </Link>

            <a
              href={`${API_BASE}/uploads/${doc._id}`}
              className="btn btn-sm btn-outline-secondary me-2"
            >
              Download
            </a>

            {isOwner && (
              <button
                className="btn btn-sm btn-outline-info"
                onClick={handleEditClick}
                disabled={updating}
              >
                {updating ? "Updating..." : "Edit"}
              </button>
            )}
          </div>

          {/* Right */}
          {isOwner && (
            <div>
              <button
                className="btn btn-sm btn-outline-danger me-2"
                onClick={handleDeleteClick}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>

              <button
                className="btn btn-sm btn-outline-warning"
                onClick={handleMarkClick}
                disabled={marking}
              >
                {marking
                  ? "Saving..."
                  : doc.isImportant
                  ? "Unmark"
                  : "Mark"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
