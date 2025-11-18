// src/pages/Projects.jsx
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function Projects() {
  // eslint-disable-next-line no-unused-vars
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form states
  const [newProject, setNewProject] = useState({ name: "", teamId: "" });
  const [editName, setEditName] = useState("");

  const loadData = async () => {
    try {
      const [projectsRes, teamsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/teams"),
      ]);

      setProjects(projectsRes.data);
      setTeams(teamsRes.data);

      // Auto-select first team if creating new project
      if (teamsRes.data.length > 0 && !newProject.teamId) {
        setNewProject(prev => ({ ...prev, teamId: teamsRes.data[0]._id }));
      }
    } catch (err) {
      alert("Failed to load projects or teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.teamId) return;

    try {
      const res = await api.post("/projects", {
        name: newProject.name,
        teamId: newProject.teamId,
      });
      setProjects([...projects, res.data]);
      setNewProject({ name: "", teamId: teams[0]?._id || "" });
      setShowCreateModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !selectedProject) return;

    try {
      const res = await api.put(`/projects/${selectedProject._id}`, { name: editName });
      setProjects(projects.map(p => p._id === selectedProject._id ? res.data : p));
      setShowEditModal(false);
      setSelectedProject(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update project");
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await api.delete(`/projects/${selectedProject._id}`);
      setProjects(projects.filter(p => p._id !== selectedProject._id));
      setShowDeleteModal(false);
      setSelectedProject(null);
      alert("Project deleted successfully");
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  // Group projects by team
  const projectsByTeam = teams.map(team => ({
    team,
    projects: projects.filter(p => p.team._id === team._id)
  })).filter(item => item.projects.length > 0);

  if (loading) {
    return <div className="p-12 text-center text-2xl">Loading Projects...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition shadow-md"
            disabled={teams.length === 0}
          >
            + New Project
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600 mb-4">
              You need to create a team first before creating projects.
            </p>
            <Link
              to="/teams"
              className="text-blue-600 hover:underline font-medium"
            >
              Go to Teams →
            </Link>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-10">
            {projectsByTeam.map(({ team, projects }) => (
              <div key={team._id} className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-blue-600">Team</span> {team.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setEditName(project.name);
                            setShowEditModal(true);
                          }}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md text-sm font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDeleteModal(true);
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md text-sm font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && teams.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project Name (e.g. Website Redesign)"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newProject.teamId}
                onChange={(e) => setNewProject({ ...newProject, teamId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Team</option>
                {teams.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-yellow-500"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition font-medium"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProject(null);
                  }}
                  className="bg-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Delete Project?</h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to delete "<strong>{selectedProject.name}</strong>"?
              <br />
              <span className="text-sm text-red-600">This cannot be undone.</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDeleteProject}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                }}
                className="bg-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}