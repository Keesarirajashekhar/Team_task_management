import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-semibold text-blue-600">
          TaskManager
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              Projects
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {user.name}{" "}
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
