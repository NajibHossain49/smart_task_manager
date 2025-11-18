import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Smart Task Manager</h1>
        <div className="flex items-center gap-4">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `px-4 py-2 rounded font-medium transition-colors ${
                isActive ? "bg-blue-700" : "hover:bg-blue-500"
              }`
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              `px-4 py-2 rounded font-medium transition-colors ${
                isActive ? "bg-blue-700" : "hover:bg-blue-500"
              }`
            }
          >
            Teams
          </NavLink>
          <span className="font-medium">Hi, {user?.name || user?.email}</span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
