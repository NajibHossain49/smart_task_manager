import Project from '../models/Project.js';
import Team from '../models/Team.js';

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  const { name, teamId } = req.body;

  try {
    // Check if team exists and user is the creator
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (team.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to create project in this team' });
    }

    const project = await Project.create({
      name,
      team: teamId,
      creator: req.user.userId,
    });

    // Populate team info in response
    await project.populate('team', 'name');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects of the logged-in user (from their teams)
// @route   GET /api/projects
// @access  Private
export const getMyProjects = async (req, res) => {
  try {
    // Find teams created by user
    const userTeams = await Team.find({ creator: req.user.userId }).select('_id');

    const teamIds = userTeams.map(t => t._id);

    const projects = await Project.find({ team: { $in: teamIds } })
      .populate('team', 'name')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project by ID (with team validation)
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Security: Only allow if user owns the team
    const team = await Team.findById(project.team._id);
    if (team.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project name
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  const { name } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const team = await Team.findById(project.team);
    if (team.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.name = name || project.name;
    await project.save();

    await project.populate('team', 'name');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const team = await Team.findById(project.team);
    if (team.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Project.deleteOne({ _id: req.params.id });
    // Later: Also delete all tasks under this project (I'll add cascade)

    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};