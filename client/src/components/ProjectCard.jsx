import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        {project.name}
      </h3>
      <p className="text-sm text-gray-500 mb-3">
        {project.description || "No description"}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Admin: {project.admin?.name || "Unknown"}</span>
        <span>{project.members?.length || 0} members</span>
      </div>
    </Link>
  );
}

export default ProjectCard;
