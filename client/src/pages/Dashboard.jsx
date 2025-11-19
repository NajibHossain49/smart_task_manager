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
import TaskListModal from "../components/TaskListModal";
import TaskModal from "../components/TaskModal";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [modalOpen, setModalOpen] = useState(false);

  // State for TaskListModal
  const [taskListModal, setTaskListModal] = useState({
    open: false,
    memberId: null,
    memberName: null,
  });

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

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

  // Load all dashboard data
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

      if (teams.length > 0 && !selectedTeam) {
        setSelectedTeam(teams[0]._id);
      }
      if (projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projects[0]._id);
      }

      setData({
        teams,
        projects,
        teamLoad: [],
        activityLogs: logsRes.data || [],
        totalProjects: projects.length,
        totalTasks: tasksRes.data.length,
      });
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Load team workload
  const loadTeamWorkload = async (teamId) => {
    if (!teamId) return;
    setTeamLoadLoading(true);
    try {
      const res = await api.get(`/tasks/team-load/${teamId}`);
      setData((prev) => ({ ...prev, teamLoad: res.data || [] }));
    } catch (err) {
      toast.error("Failed to load team workload");
    } finally {
      setTeamLoadLoading(false);
    }
  };

  // Open member tasks
  const openMemberTasks = (memberId, memberName) => {
    setTaskListModal({
      open: true,
      memberId,
      memberName,
    });
  };

  // Open unassigned tasks
  const openUnassignedTasks = () => {
    setTaskListModal({
      open: true,
      memberId: "unassigned",
      memberName: null,
    });
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (selectedTeam && !loading) {
      loadTeamWorkload(selectedTeam);
    }
  }, [selectedTeam, loading]);

  // Reassign tasks
  const handleReassign = async () => {
    if (!selectedTeam || reassigning) return;
    setReassigning(true);
    try {
      const res = await api.post("/tasks/reassign", { teamId: selectedTeam });
      toast.success(res.data.message || "Tasks reassigned successfully!");
      loadTeamWorkload(selectedTeam);
      loadAllData();
    } catch (err) {
      toast.error("Reassignment failed — action unavailable");
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
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Smart Task & Workload Management
              </p>
            </div>
            {projects.length > 0 && (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-3"
              >
                <PlusIcon className="w-6 h-6" />
                Create New Task
              </button>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Projects
                  </p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">
                    {totalProjects}
                  </p>
                </div>
                <FolderIcon className="w-12 h-12 text-blue-500 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Tasks
                  </p>
                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {totalTasks}
                  </p>
                </div>
                <ClipboardDocumentListIcon className="w-12 h-12 text-green-500 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Teams</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    {teams.length}
                  </p>
                </div>
                <UserGroupIcon className="w-12 h-12 text-purple-500 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <p className="text-gray-500 text-sm font-medium mb-3">
                Active Team
              </p>
              <select
                value={selectedTeam || ""}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Select Team --</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Workload */}
          {selectedTeam && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-10">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold">Team Workload</h2>
                    <p className="text-blue-100 mt-2">
                      Click on a member to view & manage tasks
                    </p>
                  </div>
                  <button
                    onClick={handleReassign}
                    disabled={reassigning || teamLoadLoading}
                    className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all ${
                      reassigning || teamLoadLoading
                        ? "bg-white/20 cursor-not-allowed"
                        : "bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                    }`}
                  >
                    {reassigning ? (
                      <>
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                        Reassigning...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-6 h-6" />
                        Auto Reassign Tasks
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-8">
                {teamLoadLoading ? (
                  <p className="text-center py-12 text-gray-500">
                    Loading workload...
                  </p>
                ) : teamLoad.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">
                    No team members found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b-2 border-gray-200">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">
                            Member
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700">
                            Role
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-700">
                            Load
                          </th>
                          <th className="text-center py-4 px-6 font-semibold text-gray-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamLoad.map((m) => (
                          <tr
                            key={m._id}
                            onClick={() => openMemberTasks(m._id, m.name)}
                            className="border-b hover:bg-blue-50 cursor-pointer transition-all"
                          >
                            <td className="py-6 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                                  {m.name[0].toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-800 text-lg">
                                  {m.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-6 px-6 text-gray-600">
                              {m.role}
                            </td>
                            <td className="py-6 px-6 text-center font-bold text-xl">
                              {m.currentTasks}/{m.capacity}
                            </td>
                            <td className="py-6 px-6 text-center">
                              {m.isOverloaded ? (
                                <span className="px-5 py-2 bg-red-100 text-red-700 rounded-full font-bold">
                                  Overloaded
                                </span>
                              ) : m.currentTasks >= m.capacity ? (
                                <span className="px-5 py-2 bg-yellow-100 text-yellow-700 rounded-full font-bold">
                                  Full
                                </span>
                              ) : (
                                <span className="px-5 py-2 bg-green-100 text-green-700 rounded-full font-bold">
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

              {/* Unassigned Tasks Button */}
              <div className="border-t border-gray-200 p-6 text-center">
                <button
                  onClick={openUnassignedTasks}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-lg underline"
                >
                  View All Unassigned Tasks →
                </button>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ClockIcon className="w-8 h-8" />
                Recent Activity
              </h2>
            </div>
            <div className="p-8">
              {activityLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-12 italic">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-4">
                  {activityLogs.slice(0, 10).map((log) => (
                    <div
                      key={log._id}
                      className="p-5 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <p className="font-medium text-gray-800">{log.message}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Task List Modal (With Edit, Delete, Status, Filter) */}
        {taskListModal.open && (
          <TaskListModal
            isOpen={taskListModal.open}
            onClose={() => {
              setTaskListModal({
                open: false,
                memberId: null,
                memberName: null,
              });
              loadTeamWorkload(selectedTeam);
            }}
            initialMemberId={taskListModal.memberId}
            initialMemberName={taskListModal.memberName}
            projects={projects}
            teamId={selectedTeam}
          />
        )}

        {/* Create Task Modal */}
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
