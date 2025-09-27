import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-100 border-b">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          {import.meta.env.VITE_APP_NAME || "App"}
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/map">Map</NavLink></li>
          {user?.role === "staff" && <li><NavLink to="/staff">Staff</NavLink></li>}
          {user?.role === "admin" && <li><NavLink to="/admin">Admin</NavLink></li>}
          {!user && (
            <>
              <li><NavLink to="/login">Login</NavLink></li>
              <li><NavLink to="/signup">Sign up</NavLink></li>
            </>
          )}
          {user && (
            <li>
              <details>
                <summary className="uppercase">{user.role}</summary>
                <ul className="bg-base-100 rounded-t-none p-2 z-50">
                  <li><NavLink to="/account">My Account</NavLink></li>
                  <li><button onClick={logout}>Logout</button></li>
                </ul>
              </details>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}