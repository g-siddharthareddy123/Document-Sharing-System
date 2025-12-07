// frontend/src/pages/DocumentView.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function DocumentView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);

  const blobUrlRef = useRef(null);

  useEffect(() => {
    loadMeta();
    // cleanup on unmount
    return () => {
      revokeBlob();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const revokeBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setPreviewUrl(null);
    }
  };

  const loadMeta = async () => {
    setLoadingMeta(true);
    setMetaError("");
    try {
      const res = await api.get(`/docs/${id}`);
      // backend returns { ok: true, doc }
      const data = res?.data?.doc ?? res?.data;
      setDoc(data);
    } catch (err) {
      console.error("Failed to load document metadata", err);
      const msg = err?.response?.data?.msg || err?.message || "Failed to load document";
      setMetaError(String(msg));
    } finally {
      setLoadingMeta(false);
    }
  };

  const supportsInlinePreview = (mime) => {
    if (!mime) return false;
    return mime.startsWith("image/") || mime === "application/pdf";
  };

  // fetch blob and create preview URL (or call for download)
  const fetchBlob = async (forDownload = false) => {
    setPreviewError("");
    setDownloadProgress(0);
    setPreviewLoading(true);

    try {
      const res = await api.get(`/uploads/${id}`, {
        responseType: "blob",
        onDownloadProgress: (ev) => {
          if (ev.total) {
            const pct = Math.round((ev.loaded * 100) / ev.total);
            setDownloadProgress(pct);
          }
        },
        // timeout might be needed for big files:
        timeout: 0
      });

      const blob = res.data;
      const url = URL.createObjectURL(blob);
      // revoke previous
      revokeBlob();
      blobUrlRef.current = url;
      setPreviewUrl(url);

      if (forDownload) {
        // trigger download
        const filename = doc?.filename || "download";
        triggerBrowserDownload(blob, filename);
      }
    } catch (err) {
      console.error("Failed to fetch file blob", err);
      const msg = err?.response?.data?.msg || err?.message || "Failed to fetch file";
      setPreviewError(String(msg));
    } finally {
      setPreviewLoading(false);
      setDownloadProgress(0);
    }
  };

  const triggerBrowserDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // revoke used URL
    URL.revokeObjectURL(url);
  };

  const handlePreviewClick = async () => {
    if (!doc) return;
    if (previewUrl) {
      // already fetched — just show (toggle if you want)
      return;
    }
    // only allow inline preview for supported MIME types
    if (!supportsInlinePreview(doc.contentType)) {
      setPreviewError("Inline preview not supported for this file type. Use Download.");
      return;
    }
    await fetchBlob(false);
  };

  const handleOpenNewTab = async () => {
    if (!previewUrl) {
      await fetchBlob(false);
    }
    if (blobUrlRef.current) {
      window.open(blobUrlRef.current, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = async () => {
    // fetch blob and trigger download
    // If previewUrl exists we can refetch or reuse blob - simpler to fetch again for progress & correct file
    await fetchBlob(true);
  };

  if (loadingMeta) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Loading document...</div>
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          Error loading document: {metaError}
          <div className="mt-2">
            <button className="btn btn-sm btn-secondary me-2" onClick={() => navigate(-1)}>Go back</button>
            <button className="btn btn-sm btn-primary" onClick={loadMeta}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Document not found.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 style={{ marginBottom: 6 }}>{doc.title || doc.filename || "Document"}</h3>
          <div className="text-muted small">
            {doc.uploader?.name || doc.uploaderName || "Unknown uploader"} • {doc.size ? `${(doc.size/1024).toFixed(2)} KB` : "Size unknown"} • {doc.contentType || ""}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={handlePreviewClick} disabled={previewLoading || !supportsInlinePreview(doc.contentType)}>
            {previewLoading ? "Preparing..." : "Preview"}
          </button>
          <button className="btn btn-outline-secondary" onClick={handleOpenNewTab} disabled={previewLoading}>
            Open in new tab
          </button>
          <button className="btn btn-primary" onClick={handleDownload} disabled={previewLoading}>
            {previewLoading ? `Downloading ${downloadProgress}%` : "Download"}
          </button>
          <button className="btn btn-light" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>

      {previewError && <div className="alert alert-danger">{previewError}</div>}

      {previewLoading && (
        <div className="mb-3">
          <div className="progress">
            <div className="progress-bar" role="progressbar" style={{ width: `${downloadProgress}%` }}>
              {downloadProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Preview area */}
      {previewUrl && (
        <div className="card mb-3">
          <div className="card-body">
            {doc.contentType?.startsWith("image/") && (
              <img src={previewUrl} alt={doc.filename} style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }} />
            )}

            {doc.contentType === "application/pdf" && (
              // iframe works for PDFs in most browsers
              <iframe src={previewUrl} title={doc.filename} style={{ width: "100%", height: "80vh", border: 0 }} />
            )}

            {!doc.contentType?.startsWith("image/") && doc.contentType !== "application/pdf" && (
              <div>
                <p>No inline preview available for this file type.</p>
                <a className="btn btn-primary" href={previewUrl} target="_blank" rel="noreferrer">Open file</a>
                <button className="btn btn-secondary ms-2" onClick={() => triggerBrowserDownloadFromUrl(previewUrl, doc.filename)}>Download</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metadata / description */}
      <div className="card">
        <div className="card-body">
          {doc.description && (
            <>
              <h6>Description</h6>
              <p>{doc.description}</p>
            </>
          )}

          <dl className="row">
            <dt className="col-sm-3">Filename</dt>
            <dd className="col-sm-9">{doc.filename}</dd>

            <dt className="col-sm-3">Content type</dt>
            <dd className="col-sm-9">{doc.contentType}</dd>

            <dt className="col-sm-3">Size</dt>
            <dd className="col-sm-9">{doc.size ? `${(doc.size / 1024).toFixed(2)} KB` : "Unknown"}</dd>

            <dt className="col-sm-3">Uploaded</dt>
            <dd className="col-sm-9">{new Date(doc.createdAt).toLocaleString()}</dd>
          </dl>
        </div>
      </div>
    </div>
  );

  // helper used in non-blob-download branch
  function triggerBrowserDownloadFromUrl(url, filename = "file") {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
