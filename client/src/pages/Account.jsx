import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">My Account</h1>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-col gap-1">
            <div><span className="font-semibold">Name: </span>{user?.name}</div>
            <div><span className="font-semibold">Email: </span>{user?.email}</div>
            <div><span className="font-semibold">Role: </span><span className="badge">{user?.role}</span></div>
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-outline" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}