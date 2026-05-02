import { useAuth } from "../context/AuthContext";

function TaskCard({ task, onStatusChange, onDelete }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // figure out if the task is overdue
  const isOverdue =
    task.status !== "done" && new Date(task.dueDate) < new Date();

  // pick a color for the status badge
  const statusColors = {
    todo: "bg-yellow-100 text-yellow-700",
    "in-progress": "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  };

  const handleStatusUpdate = (e) => {
    onStatusChange(task._id, e.target.value);
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 ${
        isOverdue ? "border-red-300" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-800">{task.title}</h4>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            statusColors[task.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {task.status}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Assigned to: {task.assignedTo?.name || "Unknown"}
        </span>
        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
          {isOverdue && " (Overdue!)"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={task.status}
          onChange={handleStatusUpdate}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white cursor-pointer"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="text-xs text-red-500 hover:text-red-700 ml-auto cursor-pointer"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
