import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // show a simple loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // if not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;
