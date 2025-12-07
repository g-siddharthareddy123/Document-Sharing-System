import React, { useState } from "react";

export default function ShareModal({ doc, onClose }) {
  const [email, setEmail] = useState("");
  const url = `${window.location.origin}/doc/${doc._id}`;

  const share = () => {
    // in production call backend to send email. For now just alert.
    alert(`Send ${url} to ${email}`);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: 480 }}>
        <div className="modal-content p-3">
          <h5>Share "{doc.title}"</h5>
          <p className="small text-muted">Share link (copy or email)</p>
          <input className="form-control mb-2" value={url} readOnly />
          <input className="form-control mb-2" placeholder="Recipient email" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="d-flex justify-content-end">
            <button className="btn btn-secondary me-2" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={share}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
