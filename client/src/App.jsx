import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Account from "./pages/Account";

const MapPage = lazy(() => import("./pages/Map"));
const Staff   = lazy(() => import("./pages/Staff"));
const Admin   = lazy(() => import("./pages/Admin"));

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-6">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute roles={["staff", "admin"]}>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <footer className="p-6 text-center text-sm opacity-70">
        © {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || "App"}
      </footer>
    </div>
  );
}