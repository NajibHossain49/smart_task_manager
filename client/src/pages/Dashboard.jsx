import {
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  FolderIcon,
  PlusIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  // eslint-disable-next-line no-unused-vars
  const { user, logout } = useContext(AuthContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(""); // Controlled by dropdown

  const [data, setData] = useState({
    teams: [],
    projects: [],
    teamLoad: [],
    activityLogs: [],
    totalProjects: 0,
    totalTasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);
  const [teamLoadLoading, setTeamLoadLoading] = useState(false);

  // Load all initial data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [teamsRes, projectsRes, tasksRes, logsRes] = await Promise.all([
        api.get("/teams"),
        api.get("/projects"),
        api.get("/tasks"),
        api.get("/activitylogs"),
      ]);

      const teams = teamsRes.data || [];
      const projects = projectsRes.data || [];

      // Set initial selected team (first one) if none selected yet
      if (teams.length > 0 && !selectedTeam) {
        setSelectedTeam(teams[0]._id);
      }

      // Default project (optional)
      if (projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projects[0]._id);
      }

      setData({
        teams,
        projects,
        teamLoad: [], // Will be loaded separately based on selectedTeam
        activityLogs: logsRes.data || [],
        totalProjects: projects.length,
        totalTasks: tasksRes.data.length,
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load team workload for a specific team
  const loadTeamWorkload = async (teamId) => {
    if (!teamId) {
      setData((prev) => ({ ...prev, teamLoad: [] }));
      return;
    }

    setTeamLoadLoading(true);
    try {
      const loadRes = await api.get(`/tasks/team-load/${teamId}`);
      setData((prev) => ({ ...prev, teamLoad: loadRes.data || [] }));
    } catch (err) {
      console.error("Failed to load team workload:", err);
      setData((prev) => ({ ...prev, teamLoad: [] }));
      toast.error("Could not load team workload");
    } finally {
      setTeamLoadLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Load team workload whenever selectedTeam changes
  useEffect(() => {
    if (selectedTeam && !loading) {
      loadTeamWorkload(selectedTeam);
    }
  }, [selectedTeam, loading]);

  const handleReassign = async () => {
    if (!selectedTeam || reassigning) return;

    setReassigning(true);
    try {
      const res = await api.post("/tasks/reassign", { teamId: selectedTeam });
      toast.success(res.data.message || "Tasks reassigned successfully!");

      // FIXED: Force immediate refresh of team workload and activity logs
      await Promise.all([loadTeamWorkload(selectedTeam), loadAllData()]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Reassign failed");
    } finally {
      setReassigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-xl font-medium text-gray-700">
              Loading Dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { teams, projects, teamLoad, activityLogs, totalProjects, totalTasks } =
    data;

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your projects and optimize team workload
              </p>
            </div>
            {projects.length > 0 && (
              <button
                onClick={() => setModalOpen(true)}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                New Task
              </button>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Projects Card */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                    <FolderIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">
                  Total Projects
                </h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {totalProjects}
                </p>
              </div>
            </div>

            {/* Total Tasks Card */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl group-hover:scale-110 transition-transform">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">
                  Total Tasks
                </h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  {totalTasks}
                </p>
              </div>
            </div>

            {/* Teams Card */}
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">
                  Teams
                </h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {teams.length}
                </p>
              </div>
            </div>

            {/* Active Team Dropdown Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-gray-500 text-sm font-medium mb-3">
                  Active Team
                </h3>
                <select
                  value={selectedTeam || ""}
                  onChange={(e) => {
                    const newTeamId = e.target.value;
                    setSelectedTeam(newTeamId);
                    setSelectedProjectId(""); // Reset project when team changes
                  }}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gradient-to-r from-indigo-50 to-purple-50"
                >
                  <option value="">-- Select Team --</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Team Workload */}
          {selectedTeam ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Team Workload</h2>
                    <p className="text-blue-100 flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5" />
                      Real-time capacity management
                    </p>
                  </div>
                  <button
                    onClick={handleReassign}
                    disabled={reassigning || teamLoadLoading}
                    className={`group px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2 ${
                      reassigning || teamLoadLoading
                        ? "bg-white/20 cursor-not-allowed text-white/60"
                        : "bg-white text-blue-600 hover:bg-blue-50 hover:scale-105"
                    }`}
                  >
                    {reassigning ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Reassigning...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5 group-hover:animate-pulse" />
                        Reassign Tasks
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-8">
                {teamLoadLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-500 font-medium">
                      Loading workload...
                    </p>
                  </div>
                ) : teamLoad.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                      <UserGroupIcon className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-gray-500 italic text-lg">
                      No members or tasks in this team.
                    </p>
                    <p className="text-gray-400 mt-2">
                      Add team members to get started!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                            Member
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                            Role
                          </th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                            Load
                          </th>
                          <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamLoad.map((m) => (
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
                            <td className="py-4 px-4">
                              <div className="flex flex-col items-center gap-2">
                                <span className="font-bold text-lg text-gray-800">
                                  {m.currentTasks}/{m.capacity}
                                </span>
                                <div className="w-full max-w-[120px] h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${
                                      m.isOverloaded ||
                                      m.currentTasks > m.capacity
                                        ? "bg-gradient-to-r from-red-500 to-red-600"
                                        : m.currentTasks >= m.capacity
                                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                        : "bg-gradient-to-r from-green-500 to-emerald-500"
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
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 mb-8 text-center">
              <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                <UserGroupIcon className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                Please select a team to view workload
              </p>
              <p className="text-gray-400 mt-2">
                Choose a team from the dropdown above
              </p>
            </div>
          )}

          {/* Recent Reassignments */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-7 h-7" />
                <div>
                  <h2 className="text-2xl font-bold">Recent Reassignments</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Latest activity log
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {activityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                    <ClockIcon className="w-12 h-12 text-gray-300" />
                  </div>
                  <p className="text-gray-500 italic text-lg">
                    No reassignments yet.
                  </p>
                  <p className="text-gray-400 mt-2">
                    Activity will appear here once you start reassigning tasks
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log, idx) => (
                    <div
                      key={log._id}
                      className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all border border-gray-100 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {activityLogs.length - idx}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {log.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                          <ClockIcon className="w-4 h-4" />
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Modal */}
        {modalOpen && selectedTeam && projects.length > 0 && (
          <TaskModal
            isOpen={modalOpen}
            onClose={(success) => {
              setModalOpen(false);
              if (success) {
                loadAllData();
                loadTeamWorkload(selectedTeam);
              }
            }}
            teamId={selectedTeam}
            projectId={selectedProjectId}
            projects={projects}
          />
        )}
      </div>
    </>
  );
}
