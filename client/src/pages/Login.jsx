import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123456");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      nav("/account");
    } catch (e) {
      toast.error(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">Email</label>
          <input className="input input-bordered w-full" type="email" value={email}
                 onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required/>
        </div>
        <div className="form-control">
          <label className="label">Password</label>
          <input className="input input-bordered w-full" type="password" value={password}
                 onChange={(e)=>setPassword(e.target.value)} placeholder="********" required/>
        </div>
        <button className={`btn btn-primary w-full ${loading ? "loading" : ""}`} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-3 text-sm">
        Don’t have an account? <Link className="link" to="/signup">Sign up</Link>
      </p>
    </div>
  );
}