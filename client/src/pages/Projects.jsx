import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";

function Projects() {
  const { user, api } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [formError, setFormError] = useState("");

  const isAdmin = user?.role === "admin";

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!projectName.trim()) { setFormError("Project name is required"); return; }
    try {
      await api.post("/projects", { name: projectName, description: projectDesc });
      setProjectName(""); setProjectDesc(""); setShowForm(false);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Projects</h2>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
              {showForm ? "Cancel" : "+ New Project"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Create New Project</h3>
            {formError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-3">{formError}</div>}
            <form onSubmit={handleCreateProject}>
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">Project Name</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Website Redesign" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Description (optional)</label>
                <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="What is this project about?" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 cursor-pointer">Create Project</button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-400">{isAdmin ? "No projects yet. Create your first one!" : "No projects found. Ask an admin to add you."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}
      </div>
    </>
  );
}

export default Projects;
