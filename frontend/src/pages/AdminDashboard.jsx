import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    loadSummary();
    loadPending();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await api.get("/admin/summary");
      setSummary(res.data);
    } catch {}
  };
  const loadPending = async () => {
    try {
      const res = await api.get("/admin/pending");
      setPending(res.data);
    } catch {}
  };

  const changeStatus = async (id, status) => {
    await api.post(`/admin/document/${id}/status`, { status });
    setPending(pending.filter(d => d._id !== id));
    loadSummary();
  };

  return (
    <div>
      <h3>Admin Dashboard</h3>

      <div className="row my-3">
        <div className="col-md-4">
          <div className="card p-3">
            <h6>Total</h6>
            <div style={{ fontSize: 24 }}>{summary?.total ?? "-"}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <h6>Pending</h6>
            <div style={{ fontSize: 24 }}>{summary?.pending ?? "-"}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <h6>Accepted</h6>
            <div style={{ fontSize: 24 }}>{summary?.accepted ?? "-"}</div>
          </div>
        </div>
      </div>

      <h5>Pending Documents</h5>
      {pending.length === 0 && <div>No pending documents</div>}
      {pending.map(d => (
        <div key={d._id} className="card mb-2">
          <div className="card-body d-flex justify-content-between">
            <div>
              <h6>{d.title}</h6>
              <div className="small text-muted">{d.uploader?.name} • {d.uploader?.email}</div>
            </div>
            <div>
              <button className="btn btn-success me-2" onClick={() => changeStatus(d._id, "accepted")}>Accept</button>
              <button className="btn btn-danger" onClick={() => changeStatus(d._id, "rejected")}>Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
