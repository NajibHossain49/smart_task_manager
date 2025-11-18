import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamLoad, setTeamLoad] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "auto", // "auto" or memberId
    priority: "medium",
  });

  const loadData = async () => {
    try {
      const [projRes, tasksRes, loadRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
        api.get(`/tasks/team-load/${id}`).catch(() => []), // fallback
      ]);

      setProject(projRes.data);
      setTasks(tasksRes.data);
      setTeamLoad(loadRes.data || []);
    } catch (err) {
      alert("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      let assignee = taskForm.assignedTo;

      if (assignee === "auto") {
        const suggest = await api.get(
          `/teams/${project.team._id}/suggest-assignee`
        );
        assignee = suggest.data._id;
      }

      const res = await api.post("/tasks", {
        title: taskForm.title,
        description: taskForm.description,
        projectId: id,
        assignedTo: assignee === "unassigned" ? null : assignee,
        priority: taskForm.priority,
      });

      setTasks([res.data, ...tasks]);
      setTaskForm({
        title: "",
        description: "",
        assignedTo: "auto",
        priority: "medium",
      });
      setShowTaskModal(false);
      loadData(); // Refresh load
    } catch (err) {
      if (err.response?.data?.message === "overcapacity") {
        if (confirm(`${err.response.data.warning}\nAssign anyway?`)) {
          // Force assign
          await api.post("/tasks", {
            ...taskForm,
            projectId: id,
            assignedTo: err.response.data.memberId,
          });
          loadData();
          setShowTaskModal(false);
        }
      } else {
        alert(err.response?.data?.message || "Failed to create task");
      }
    }
  };

  if (loading)
    return <div className="p-12 text-center text-2xl">Loading...</div>;
  if (!project)
    return (
      <div className="p-12 text-center text-red-600">Project not found</div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                {project.name}
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Team: <strong>{project.team.name}</strong>
              </p>
            </div>
            <Link to="/projects" className="text-blue-600 hover:underline">
              Back to Projects
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tasks ({tasks.length})</h2>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  + New Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  No tasks yet. Create one!
                </p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="border rounded-lg p-5 hover:shadow transition"
                    >
                      <h3 className="text-xl font-semibold">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 mt-2">{task.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-4 text-sm">
                        <span>
                          Assigned to:{" "}
                          <strong>
                            {task.assignedTo?.name || "Unassigned"}
                          </strong>
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Load */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Team Workload</h3>
              {teamLoad.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded mb-3"
                >
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.role}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        m.isOverloaded ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {m.currentTasks} / {m.capacity}
                    </p>
                    {m.isOverloaded && (
                      <span className="text-xs text-red-600">Overloaded!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">New Task</h2>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                className="w-full p-3 border rounded-lg mb-4"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                rows="3"
                className="w-full p-3 border rounded-lg mb-4"
              />
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
                className="w-full p-3 border rounded-lg mb-4"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <select
                value={taskForm.assignedTo}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, assignedTo: e.target.value })
                }
                className="w-full p-3 border rounded-lg mb-6"
              >
                <option value="auto">Auto-Assign (Smart)</option>
                {teamLoad.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.currentTasks}/{m.capacity})
                  </option>
                ))}
                <option value="unassigned">Unassigned</option>
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="bg-gray-300 px-6 py-3 rounded-lg"
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
