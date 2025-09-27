import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* use vite base as router basename so routes work under /restroom-finder */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <App />
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);