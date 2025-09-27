import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("Pasindu Jayasinghe");
  const [email, setEmail] = useState("pasindu@example.com");
  const [password, setPassword] = useState("User@123456");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created!");
      nav("/account");
    } catch (e) {
      toast.error(e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">Name</label>
          <input className="input input-bordered w-full" value={name}
                 onChange={(e)=>setName(e.target.value)} placeholder="Your name" required/>
        </div>
        <div className="form-control">
          <label className="label">Email</label>
          <input className="input input-bordered w-full" type="email" value={email}
                 onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required/>
        </div>
        <div className="form-control">
          <label className="label">Password</label>
          <input className="input input-bordered w-full" type="password" value={password}
                 onChange={(e)=>setPassword(e.target.value)} placeholder="At least 8 characters" required/>
        </div>
        <button className={`btn btn-primary w-full ${loading ? "loading" : ""}`} disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p className="mt-3 text-sm">
        Already have an account? <Link className="link" to="/login">Login</Link>
      </p>
    </div>
  );
}