import Team from "../models/Team.js";
import TeamMember from "../models/TeamMember.js";

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
export const createTeam = async (req, res) => {
  const { name } = req.body;

  try {
    const team = await Team.create({
      name,
      creator: req.user.userId,
      members: [],
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all teams for the user
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ creator: req.user.userId }).populate(
      "members"
    );
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a member to a team
// @route   POST /api/teams/:teamId/members
// @access  Private
export const addMember = async (req, res) => {
  const { teamId } = req.params;
  const { name, role, capacity } = req.body;

  try {
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to add member" });
    }

    const member = await TeamMember.create({
      name,
      role,
      capacity,
      team: teamId,
    });

    team.members.push(member._id);
    await team.save();

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team members with load (currentTasks / capacity)
// @route   GET /api/teams/:teamId/load
// @access  Private
export const getTeamLoad = async (req, res) => {
  const { teamId } = req.params;

  try {
    const members = await TeamMember.find({ team: teamId });

    // For now, currentTasks is dummy (0); I'll update in Task implementation
    const load = members.map((member) => ({
      _id: member._id,
      name: member.name,
      role: member.role,
      capacity: member.capacity,
      currentTasks: 0, // Placeholder
      isOverloaded: 0 > member.capacity,
    }));

    res.json(load);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suggest assignee (member with least load)
// @route   GET /api/teams/:teamId/suggest-assignee
// @access  Private
export const suggestAssignee = async (req, res) => {
  const { teamId } = req.params;

  try {
    const members = await TeamMember.find({ team: teamId });

    // Placeholder logic; currentTasks = 0 for now
    const suggested = members
      .filter((m) => 0 < m.capacity)
      .sort((a, b) => 0 - 0 || a.capacity - b.capacity)[0]; // Least tasks, then highest capacity

    if (!suggested) {
      return res.status(404).json({ message: "No available members" });
    }

    res.json(suggested);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
