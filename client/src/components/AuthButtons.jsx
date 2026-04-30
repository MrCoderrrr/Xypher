import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

function AuthButtons() {
  const { user, logout } = useAuth();
  if (!user) return <Link to="/login" className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white">Sign in</Link>;
  return (
    <div className="group relative">
      <button><Avatar src={user.avatar} name={user.name} size="sm" /></button>
      <div className="absolute right-0 top-10 hidden w-44 rounded-xl border border-border bg-bg-card p-2 shadow-card group-hover:block">
        <Link className="block rounded-lg px-3 py-2 hover:bg-white/5" to="/dashboard">Profile</Link>
        <button className="block w-full rounded-lg px-3 py-2 text-left hover:bg-white/5">Settings</button>
        <button className="block w-full rounded-lg px-3 py-2 text-left text-red-400 hover:bg-white/5" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}

export default AuthButtons;
