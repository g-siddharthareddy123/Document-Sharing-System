import React, { useState } from "react";

/*
A simple dropdown showing notifications; clicking doesn't mark read in this simple version.
You can extend to call backend to mark read.
*/
export default function Notifications({ count = 0 }) {
  const [open, setOpen] = useState(false);
  const notifs = JSON.parse(localStorage.getItem("user") || "{}").notifications || [];

  return (
    <div className="position-relative">
      <button className="btn btn-outline-secondary" onClick={() => setOpen(!open)}>
        🔔 {count > 0 && <span className="badge bg-danger ms-1">{count}</span>}
      </button>

      {open && (
        <div className="card position-absolute" style={{ right: 0, width: 320, zIndex: 1000 }}>
          <div className="card-body p-2">
            <h6 className="mb-2">Notifications</h6>
            {notifs.length === 0 && <div className="text-muted">No notifications</div>}
            {notifs.map((n, i) => (
              <div key={i} className="p-2 border-bottom">
                <div style={{ fontSize: 13 }}>{n.message}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{new Date(n.date).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
