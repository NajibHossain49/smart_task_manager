import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center group">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                <svg
                  className="w-5 h-5 text-blue-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:from-blue-50 group-hover:to-white transition-all duration-300">
                Smart Task Manager
              </h1>
            </div>
          </Link>

          {/* Navigation Links & User Section */}
          <div className="flex items-center space-x-2">
            {/* Navigation Links */}
            <div className="flex items-center space-x-1 mr-4">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1.5 ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-blue-50 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Profile</span>
              </NavLink>

              <NavLink
                to="/teams"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1.5 ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-blue-50 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Teams</span>
              </NavLink>

              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1.5 ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-blue-50 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span>Projects</span>
              </NavLink>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l border-white/20">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm text-blue-50">
                  {user?.name || user?.email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-1.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
