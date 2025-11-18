// client/src/components/TaskModal.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TaskModal({ isOpen, onClose, teamId, projectId: initialProjectId, projects = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [assignedTo, setAssignedTo] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    if (isOpen && teamId) {
      loadTeamLoad();
    }
    if (isOpen && projects.length > 0 && !projectId) {
      setProjectId(projects[0]._id);
    }
  }, [isOpen, teamId, projects]);

  const loadTeamLoad = async () => {
    try {
      const res = await api.get(`/tasks/team-load/${teamId}`);
      setTeamMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !projectId) return;

    setLoading(true);
    setWarning(null);

    try {
      const payload = {
        title,
        description: description || '',
        projectId,
        assignedTo: assignedTo || null,
        priority,
      };

      const res = await api.post('/tasks', payload);

      if (res.data.message === 'overcapacity') {
        setWarning(res.data);
        setLoading(false);
        return;
      }

      onClose(true);
    } catch (err) {
      if (err.response?.data?.message === 'overcapacity') {
        setWarning(err.response.data);
      } else {
        alert('Task creation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAnyway = async () => {
    try {
      await api.post('/tasks', {
        title,
        description: description || '',
        projectId,
        assignedTo: warning.memberId,
        priority,
      });
      onClose(true);
    } catch (err) {
      alert('Failed to assign');
    }
  };

  const handleAutoAssign = async () => {
    try {
      const res = await api.get(`/teams/${teamId}/suggest-assignee`);
      setAssignedTo(res.data._id);
      alert(`Auto-assigned to ${res.data.name}`);
    } catch (err) {
      alert('No available member found');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 max-h-screen overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Task</h2>

        {warning && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-5 rounded-lg mb-6">
            <p className="font-semibold">Warning: {warning.warning}</p>
            <div className="mt-4 flex gap-3">
              <button onClick={handleAssignAnyway} className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700">
                Assign Anyway
              </button>
              <button onClick={() => setWarning(null)} className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700">
                Choose Another
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Select */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-28 resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Assign To */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-gray-700">Assign To</label>
              <button type="button" onClick={handleAutoAssign} className="text-blue-600 hover:underline text-sm font-medium">
                Auto-assign
              </button>
            </div>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {teamMembers.map(m => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.role}) — {m.currentTasks}/{m.capacity} {m.isOverloaded && '⚠️ Overloaded'}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}