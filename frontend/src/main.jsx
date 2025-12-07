import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

// Toastify CSS (VERY IMPORTANT)
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />

    {/* Toast notifications root — must be inside React tree */}
    <ToastContainer
      position="top-right"
      autoClose={2500}
      pauseOnHover
      newestOnTop
      theme="light"
    />
  </React.StrictMode>
);
