import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // add member form
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMsg, setMemberMsg] = useState("");

  // add task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskError, setTaskError] = useState("");

  const isAdmin = user?.role === "admin";

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?project=${id}`);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProject(), fetchTasks()]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberMsg("");
    if (!memberEmail.trim()) return;
    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberMsg(res.data.message);
      setMemberEmail("");
      fetchProject();
    } catch (err) {
      setMemberMsg(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError("");
    if (!taskTitle || !taskAssignee || !taskDueDate) {
      setTaskError("Fill all required fields");
      return;
    }
    try {
      await api.post("/tasks", {
        title: taskTitle, description: taskDesc,
        project: id, assignedTo: taskAssignee, dueDate: taskDueDate,
      });
      setTaskTitle(""); setTaskDesc(""); setTaskAssignee(""); setTaskDueDate("");
      setShowTaskForm(false);
      fetchTasks();
    } catch (err) {
      setTaskError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate("/projects");
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  if (loading) {
    return (<><Navbar /><div className="flex items-center justify-center min-h-[60vh]"><p className="text-gray-500">Loading...</p></div></>);
  }

  if (!project) {
    return (<><Navbar /><div className="max-w-6xl mx-auto px-4 py-8 text-center"><p className="text-gray-500">Project not found</p></div></>);
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{project.description || "No description"}</p>
            <p className="text-xs text-gray-400 mt-1">Admin: {project.admin?.name}</p>
          </div>
          {isAdmin && (
            <button onClick={handleDeleteProject} className="text-sm text-red-500 hover:text-red-700 cursor-pointer">
              Delete Project
            </button>
          )}
        </div>

        {/* Members Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Members ({project.members?.length || 0})</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {project.members?.map((m) => (
              <span key={m._id} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                {m.name} ({m.email})
              </span>
            ))}
          </div>
          {isAdmin && (
            <form onSubmit={handleAddMember} className="flex gap-2 items-center">
              <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="Add member by email" className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 cursor-pointer">Add</button>
            </form>
          )}
          {memberMsg && <p className="text-xs text-gray-500 mt-2">{memberMsg}</p>}
        </div>

        {/* Tasks Section */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-gray-700">Tasks ({tasks.length})</h3>
          {isAdmin && (
            <button onClick={() => setShowTaskForm(!showTaskForm)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 cursor-pointer">
              {showTaskForm ? "Cancel" : "+ Add Task"}
            </button>
          )}
        </div>

        {/* Create Task Form */}
        {showTaskForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            {taskError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-3">{taskError}</div>}
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title *</label>
                <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Assign To *</label>
                  <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select member</option>
                    {project.members?.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Due Date *</label>
                  <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 cursor-pointer">Create Task</button>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-400">No tasks in this project yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ProjectDetail;
