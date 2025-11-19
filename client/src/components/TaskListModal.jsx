import { PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function TaskListModal({
  isOpen,
  onClose,
  initialMemberId,
  initialMemberName,
  projects,
  teamId,
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Edit state
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      let url = "/tasks";
      const params = new URLSearchParams();
      if (initialMemberId === "unassigned")
        params.append("memberId", "unassigned");
      else if (initialMemberId) params.append("memberId", initialMemberId);
      if (selectedProject) params.append("projectId", selectedProject);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadTasks();
  }, [isOpen, selectedProject, initialMemberId]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Status updated!");
      loadTasks();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${deleteConfirm}`);
      toast.success("Task deleted!");
      setDeleteConfirm(null);
      loadTasks();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const startEdit = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status || "pending",
    });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/tasks/${editingTask}`, editForm);
      toast.success("Task updated!");
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {initialMemberName ? `${initialMemberName}'s Tasks` : "Tasks"}
            {initialMemberId === "unassigned" && " (Unassigned)"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filter */}
        <div className="p-6 border-b bg-gray-50 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadTasks}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center py-12">Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="text-center py-12 text-gray-500 italic">
              No tasks found
            </p>
          ) : (
            <div className="space-y-5">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  {editingTask === task._id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="w-full text-xl font-bold border-b-2 border-blue-500 focus:outline-none"
                        autoFocus
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg resize-none"
                        rows="3"
                        placeholder="Description (optional)"
                      />
                      <div className="flex gap-4">
                        <select
                          value={editForm.priority}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              priority: e.target.value,
                            })
                          }
                          className="px-4 py-2 border rounded-lg"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className="px-4 py-2 border rounded-lg"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={saveEdit}
                          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="px-5 py-2 border rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          {task.title}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(task)}
                            className="p-2 hover:bg-blue-50 rounded-lg"
                          >
                            <PencilIcon className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(task._id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <TrashIcon className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 mb-4">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <span
                          className={`px-4 py-1 rounded-full font-bold text-white ${
                            task.priority === "high"
                              ? "bg-red-500"
                              : task.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                        <span className="text-gray-600">
                          Project: {task.project?.name || "None"}
                        </span>
                        <span className="text-gray-600">
                          Assigned: {task.assignedTo?.name || "Unassigned"}
                        </span>
                      </div>

                      <div>
                        <label className="font-medium">Status: </label>
                        <select
                          value={task.status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(task._id, e.target.value)
                          }
                          className="ml-3 px-4 py-2 border rounded-lg font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Delete Task?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
