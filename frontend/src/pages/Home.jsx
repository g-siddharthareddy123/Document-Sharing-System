// src/pages/Home.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import DocumentCard from "../components/DocumentCard";
import { toast } from "react-toastify";
import "./Home.css";

const PAGE_SIZE = 9;

export default function Home() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line
  }, [user]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user?.email) params.authorEmail = user.email;

      const res = await api.get("/uploads", { params });
      const list = res?.data?.list ?? res?.data ?? [];
      setDocs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const debouncedQuery = useDebounce(q, 250);

  const filteredDocs = useMemo(() => {
    const term = debouncedQuery.toLowerCase().trim();
    if (!term) return docs;
    return docs.filter(
      (d) =>
        (d.title || d.filename || "").toLowerCase().includes(term) ||
        (d.description || "").toLowerCase().includes(term) ||
        (d.uploader?.name || d.uploaderName || "")
          .toLowerCase()
          .includes(term)
    );
  }, [docs, debouncedQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocs.length / PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);

  const pageDocs = filteredDocs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="home-page">
      <div className="container home-container">

        {/* ===== TOP BAR ===== */}
        <div className="home-top-bar">
          {/* Left: Title */}
          <div className="home-left">
            <h2 className="home-title">Documents</h2>
            <p className="home-subtitle">Manage and share your files</p>
          </div>

          {/* Center: Search only */}
          <div className="home-center">
            <input
              type="text"
              className="home-search-input"
              placeholder="🔍 Search documents..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Right: empty (keeps centering perfect) */}
          <div className="home-right" />
        </div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <div className="text-muted mt-2">Loading documents...</div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="card p-4 text-center text-muted">
            No documents found
          </div>
        ) : (
          <>
            <div className="row g-3">
              {pageDocs.map((doc) => (
                <div className="col-md-4" key={doc._id}>
                  <DocumentCard
                    doc={doc}
                    currentUserEmail={user?.email}
                  />
                </div>
              ))}
            </div>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="home-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>

                <span>
                  {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ===== debounce helper ===== */
function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
