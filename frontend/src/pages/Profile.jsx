import React, { useState } from "react";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const save = () => {
    // in production call API to update user; for now update localStorage
    const updated = { ...user, name, email };
    localStorage.setItem("user", JSON.stringify(updated));
    alert("Saved (local only)");
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h3>Profile & Settings</h3>
      <div className="mb-2">
        <label className="form-label">Name</label>
        <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="form-label">Email</label>
        <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={save}>Save</button>
    </div>
  );
}
