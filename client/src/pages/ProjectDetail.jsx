// src/pages/ProjectDetail.jsx
import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignee: "", // Will be auto-filled by smart suggest
  });

  const loadProjectData = async () => {
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`), // Assuming you have this filter
        api.get(`/teams/${projectRes?.data?.team?._id || ""}/load`).catch(() => []),
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setTeamMembers(membersRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleSmartCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      // Step 1: Get smart suggestion
      const suggestRes = await api.get(`/teams/${project.team._id}/suggest-assignee`);
      const suggestedMember = suggestRes.data;

      // Step 2: Create task with suggested assignee
      const res = await api.post("/tasks", {
        title: taskForm.title,
        description: taskForm.description,
        projectId: id,
        assignee: suggestedMember._id,
      });

      setTasks([...tasks, res.data]);
      setTaskForm({ title: "", description: "", assignee: "" });
      setShowTaskModal(false);
      alert(`Task auto-assigned to ${suggestedMember.name}!`);
      loadProjectData(); // Refresh workload
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    }
  };

  if (loading) return <div className="p-12 text-center text-2xl">Loading Project...</div>;
  if (!project) return <div className="p-12 text-center text-2xl text-red-600">Project not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{project.name}</h1>
              <p className="text-lg text-gray-600 mt-2">
                Team: <span className="font-semibold">{project.team.name}</span>
              </p>
            </div>
            <Link
              to="/projects"
              className="text-blue-600 hover:underline font-medium"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tasks</h2>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Smart New Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-12 text-lg">
                  No tasks yet. Create your first smart task!
                </p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                      <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 mt-2">{task.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500">
                          Assigned to: <strong>{task.assignee?.name || "Unassigned"}</strong>
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : task.status === "in-progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {task.status || "To Do"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Workload Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Current Team Load</h3>
              {teamMembers.length === 0 ? (
                <p className="text-gray-500">No members</p>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((m) => (
                    <div key={m._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {m.currentTasks || 0} / {m.capacity}
                        </p>
                        <span className={`text-xs font-medium ${
                          (m.currentTasks || 0) >= m.capacity
                            ? "text-red-600"
                            : "text-green-600"
                        }`}>
                          {(m.currentTasks || 0) >= m.capacity ? "Overloaded" : "Available"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Smart New Task</h2>
            <form onSubmit={handleSmartCreateTask}>
              <input
                type="text"
                placeholder="Task Title (e.g. Fix login bug)"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500"
              />
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-800 font-medium flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  Smart Assignment Active
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  The task will be auto-assigned to the member with the most availability.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create & Auto-Assign
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="bg-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}