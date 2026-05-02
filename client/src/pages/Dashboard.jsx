import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

function Dashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/tasks/dashboard");
      setStats(res.data.stats);
      setRecentTasks(res.data.recentTasks);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchDashboard(); // refresh data
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.todo}</p>
            <p className="text-xs text-gray-500 mt-1">To Do</p>
          </div>
          <div className="bg-white border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.done}</p>
            <p className="text-xs text-gray-500 mt-1">Done</p>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-xs text-gray-500 mt-1">Overdue</p>
          </div>
        </div>

        {/* Recent Tasks */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Your Tasks
        </h3>

        {recentTasks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-400">
              No tasks yet. Create a project and add some tasks!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
