import api from "./api";

// Create a new team
export const createTeam = async (teamData) => {
  try {
    const response = await api.post("/teams", teamData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to create team";
  }
};

// Get all teams for the user
export const getTeams = async () => {
  try {
    const response = await api.get("/teams");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch teams";
  }
};

// Add a member to a team
export const addTeamMember = async (teamId, memberData) => {
  try {
    const response = await api.post(`/teams/${teamId}/members`, memberData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to add member";
  }
};

// Get team load (workload distribution)
export const getTeamLoad = async (teamId) => {
  try {
    const response = await api.get(`/teams/${teamId}/load`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch team load";
  }
};

// Get suggested assignee for a task
export const getSuggestedAssignee = async (teamId) => {
  try {
    const response = await api.get(`/teams/${teamId}/suggest-assignee`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to get suggestion";
  }
};
