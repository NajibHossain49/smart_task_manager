// src/pages/Teams.jsx
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { SparklesIcon } from "@heroicons/react/24/outline"; // Optional: npm install @heroicons/react

export default function Teams() {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const [newTeamName, setNewTeamName] = useState("");
  const [memberForm, setMemberForm] = useState({
    name: "",
    role: "Developer",
    capacity: 5,
  });

  const loadTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      alert("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId) => {
    try {
      const res = await api.get(`/teams/${teamId}/load`);
      setTeamMembers(res.data);
    } catch (err) {
      console.error("Failed to load team members:", err);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      const res = await api.post("/teams", { name: newTeamName });
      setTeams([...teams, res.data]);
      setNewTeamName("");
      setShowCreateModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create team");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      const res = await api.post(`/teams/${selectedTeam._id}/members`, memberForm);
      setTeamMembers([
        ...teamMembers,
        { ...res.data, currentTasks: 0, isOverloaded: false },
      ]);
      setMemberForm({ name: "", role: "Developer", capacity: 5 });
      setShowAddMemberModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleSuggestAssignee = async () => {
    if (!selectedTeam) return;

    try {
      const res = await api.get(`/teams/${selectedTeam._id}/suggest-assignee`);
      const suggested = res.data;
      alert(
        `Smart Suggestion: Assign to ${suggested.name}\n` +
        `Role: ${suggested.role} | Capacity: ${suggested.capacity} | Current Tasks: ${suggested.currentTasks || 0}\n\n` +
        `This member has the most availability!`
      );
    } catch (err) {
      if (err.response?.status === 404) {
        alert("No available members in this team yet.");
      } else {
        alert("Could not get suggestion. Make sure team has members with capacity.");
      }
    }
  };

  const openTeam = (team) => {
    setSelectedTeam(team);
    loadTeamMembers(team._id);
  };

  if (loading) {
    return <div className="p-12 text-center text-2xl">Loading Teams...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Teams</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
          >
            + Create New Team
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teams.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center text-lg">
              No teams yet. Create your first team!
            </p>
          ) : (
            teams.map((team) => (
              <div
                key={team._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
                onClick={() => openTeam(team)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {team.members?.length || 0} members
                  </p>
                  <p className="text-xs text-gray-400 mt-4">Created by you</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Team Details */}
        {selectedTeam && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                <p className="text-gray-600">Team Members & Workload</p>
              </div>
              <div className="flex gap-3">
                {/* Smart Suggest Button */}
                <button
                  onClick={handleSuggestAssignee}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-medium flex items-center gap-2 transition shadow-md"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Suggest Best Member
                </button>

                {/* Add Member Button */}
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium transition shadow-md"
                >
                  + Add Member
                </button>
              </div>
            </div>

            {teamMembers.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">
                No members yet. Add your first member!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-3 font-semibold">Name</th>
                      <th className="text-left py-3 font-semibold">Role</th>
                      <th className="text-center py-3 font-semibold">Capacity</th>
                      <th className="text-center py-3 font-semibold">Current Load</th>
                      <th className="text-center py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((m) => (
                      <tr key={m._id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-4 font-medium">{m.name}</td>
                        <td className="py-4 text-gray-600">{m.role}</td>
                        <td className="py-4 text-center">{m.capacity}</td>
                        <td className="py-4 text-center font-bold text-blue-600">
                          {m.currentTasks || 0}
                        </td>
                        <td className="py-4 text-center">
                          {m.isOverloaded ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                              Overloaded
                            </span>
                          ) : m.currentTasks >= m.capacity ? (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                              Full
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              Available
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              <input
                type="text"
                placeholder="Team Name (e.g. Alpha Squad)"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Create Team
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

      {/* Add Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Add Member to {selectedTeam.name}
            </h2>
            <form onSubmit={handleAddMember}>
              <input
                type="text"
                placeholder="Member Name"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                required
              />
              <select
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              >
                <option>Developer</option>
                <option>Designer</option>
                <option>QA</option>
                <option>DevOps</option>
                <option>Manager</option>
              </select>
              <input
                type="number"
                placeholder="Weekly Capacity (e.g. 5 tasks)"
                value={memberForm.capacity}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, capacity: Number(e.target.value) })
                }
                min="1"
                max="30"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setMemberForm({ name: "", role: "Developer", capacity: 5 });
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
    </div>
  );
}