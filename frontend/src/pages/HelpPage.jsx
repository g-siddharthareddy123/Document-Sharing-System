// src/pages/HelpPage.jsx
import React, { useState } from "react";
import api from "../api/axios";

export default function HelpPage() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(null);

  const send = async () => {
    setStatus(null);
    try {
      await api.post("/help", { message: msg });
      setStatus("sent");
      setMsg("");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="card p-3">
      <h5>Contact Admin</h5>
      <textarea className="form-control mb-2" rows={4} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Explain the issue..." />
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={send}>Send</button>
        <button className="btn btn-outline-secondary" onClick={()=>setMsg("")}>Clear</button>
      </div>
      {status==="sent" && <div className="mt-2 text-success">Message sent to admin.</div>}
      {status==="error" && <div className="mt-2 text-danger">Failed to send message.</div>}
    </div>
  );
}
