import {
  PlusIcon,
  SparklesIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

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
  role: "",  
  capacity: 5,
});

  const loadTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      toast.error("Failed to load teams");
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
      toast.error(err.response?.data?.message || "Failed to create team");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      const res = await api.post(
        `/teams/${selectedTeam._id}/members`,
        memberForm
      );
      setTeamMembers([
        ...teamMembers,
        { ...res.data, currentTasks: 0, isOverloaded: false },
      ]);
      setMemberForm({ name: "", role: "Developer", capacity: 5 });
      setShowAddMemberModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleSuggestAssignee = async () => {
    if (!selectedTeam) return;

    try {
      const res = await api.get(`/teams/${selectedTeam._id}/suggest-assignee`);
      const suggested = res.data;

      toast.success(
        `Assign to: ${suggested.name} | Role: ${suggested.role} | Capacity: ${
          suggested.capacity
        } | Current Tasks: ${suggested.currentTasks || 0}`,
        {
          autoClose: false,
          closeButton: true,
        }
      );
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("No available members in this team yet.");
      } else {
        toast.error(
          "Could not get suggestion. Make sure team has members with capacity."
        );
      }
    }
  };

  const openTeam = (team) => {
    setSelectedTeam(team);
    loadTeamMembers(team._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-xl font-medium text-gray-700">
              Loading Teams...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <ToastContainer />

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              My Teams
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your teams and optimize workload distribution
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Team
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teams.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No teams yet</p>
              <p className="text-gray-400 mt-2">
                Create your first team to get started!
              </p>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-300 overflow-hidden transform hover:scale-105"
                onClick={() => openTeam(team)}
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl group-hover:scale-110 transition-transform">
                      <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                      {team.members?.length || 0} members
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Created by you
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Team Details */}
        {selectedTeam && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-blue-100 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5" />
                    Team Members & Workload Management
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSuggestAssignee}
                    className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg border border-white/20 hover:scale-105"
                  >
                    <SparklesIcon className="w-5 h-5 group-hover:animate-pulse" />
                    Auto Suggest
                  </button>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="bg-white text-blue-600 px-5 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Member
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                    <UserGroupIcon className="w-12 h-12 text-gray-300" />
                  </div>
                  <p className="text-gray-500 italic text-lg">No members yet</p>
                  <p className="text-gray-400 mt-2">
                    Add your first team member to get started!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                          Current Load
                        </th>
                        <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((m, idx) => (
                        <tr
                          key={m._id}
                          className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-800">
                                {m.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                              {m.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-semibold text-gray-700">
                              {m.capacity}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-bold text-lg text-blue-600">
                                {m.currentTasks || 0}
                              </span>
                              <div className="w-full max-w-[80px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    m.isOverloaded ||
                                    m.currentTasks > m.capacity
                                      ? "bg-red-500"
                                      : m.currentTasks >= m.capacity
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      (m.currentTasks / m.capacity) * 100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {m.isOverloaded ? (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold border border-red-200">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                Overloaded
                              </span>
                            ) : m.currentTasks >= m.capacity ? (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-semibold border border-yellow-200">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                Full
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-200">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
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
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Create New Team
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Build your dream team
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alpha Squad, Design Team"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Create Team
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Add Team Member
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  to {selectedTeam.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setMemberForm({ name: "", role: "Developer", capacity: 5 });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Member Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={memberForm.name}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, name: e.target.value })
                  }
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Developer, Designer, QA, DevOps"
                  value={memberForm.role}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, role: e.target.value })
                  }
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the member&apos;s role or job title
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weekly Capacity
                </label>
                <input
                  type="number"
                  placeholder="Number of tasks"
                  value={memberForm.capacity}
                  onChange={(e) =>
                    setMemberForm({
                      ...memberForm,
                      capacity: Number(e.target.value),
                    })
                  }
                  min="1"
                  max="30"
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum tasks this member can handle per week
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setMemberForm({ name: "", role: "Developer", capacity: 5 });
                  }}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
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
