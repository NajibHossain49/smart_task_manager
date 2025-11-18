import { useContext, useEffect, useState } from "react";
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
      alert("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load team workload for a specific team
  const loadTeamWorkload = async (teamId) => {
    if (!teamId) {
      setData(prev => ({ ...prev, teamLoad: [] }));
      return;
    }

    setTeamLoadLoading(true);
    try {
      const loadRes = await api.get(`/tasks/team-load/${teamId}`);
      setData(prev => ({ ...prev, teamLoad: loadRes.data || [] }));
    } catch (err) {
      console.error("Failed to load team workload:", err);
      setData(prev => ({ ...prev, teamLoad: [] }));
      alert("Could not load team workload");
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
  }, [selectedTeam]);

  const handleReassign = async () => {
    if (!selectedTeam || reassigning) return;

    setReassigning(true);
    try {
      const res = await api.post("/tasks/reassign", { teamId: selectedTeam });
      alert(res.data.message || "Tasks reassigned successfully!");
      await loadTeamWorkload(selectedTeam); // Refresh workload
      loadAllData(); // Refresh logs + counts
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Reassign failed");
    } finally {
      setReassigning(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-2xl text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  const { teams, projects, teamLoad, activityLogs, totalProjects, totalTasks } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          {projects.length > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              + New Task
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{totalProjects}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Tasks</h3>
            <p className="text-3xl font-bold text-green-600">{totalTasks}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Teams</h3>
            <p className="text-3xl font-bold text-purple-600">{teams.length}</p>
          </div>

          {/* Active Team Dropdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Active Team</h3>
            <select
              value={selectedTeam || ""}
              onChange={(e) => {
                const newTeamId = e.target.value;
                setSelectedTeam(newTeamId);
                setSelectedProjectId(""); // Reset project when team changes
              }}
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg text-lg font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
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

        {/* Team Workload */}
        {selectedTeam ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Team Workload</h2>
              <button
                onClick={handleReassign}
                disabled={reassigning || teamLoadLoading}
                className={`px-6 py-3 rounded font-medium text-white transition ${
                  reassigning || teamLoadLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {reassigning ? "Reassigning..." : "Reassign Tasks"}
              </button>
            </div>

            {teamLoadLoading ? (
              <p className="text-center py-8 text-gray-500">Loading workload...</p>
            ) : teamLoad.length === 0 ? (
              <p className="text-center py-8 text-gray-500 italic">
                No members or tasks in this team.
              </p>
            ) : (
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3">Member</th>
                    <th className="text-left py-3">Role</th>
                    <th className="text-center py-3">Load</th>
                    <th className="text-center py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLoad.map((m) => (
                    <tr key={m._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-medium">{m.name}</td>
                      <td className="py-4 text-gray-600">{m.role}</td>
                      <td className="py-4 text-center font-bold">
                        {m.currentTasks}/{m.capacity}
                      </td>
                      <td className="py-4 text-center">
                        {m.isOverloaded ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            Overloaded
                          </span>
                        ) : m.currentTasks >= m.capacity ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                            Full
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-8 text-center text-gray-500">
            <p>Please select a team to view workload</p>
          </div>
        )}

        {/* Recent Reassignments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Reassignments</h2>
          {activityLogs.length === 0 ? (
            <p className="text-gray-500 italic">No reassignments yet.</p>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="font-medium">{log.message}</span>
                </div>
              ))}
            </div>
          )}
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
  );
}