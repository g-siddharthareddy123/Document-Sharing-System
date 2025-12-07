import React, { useState } from "react";

export default function PasswordModal({ onSubmit, onClose }) {
  const [password, setPassword] = useState("");

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: 480 }}>
        <div className="modal-content p-3">
          <h5>Enter password to open</h5>
          <input className="form-control my-2" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="d-flex justify-content-end">
            <button className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSubmit(password)}>Open</button>
          </div>
        </div>
      </div>
    </div>
  );
}
