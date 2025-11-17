import Task from '../models/Task.js';
import TeamMember from '../models/TeamMember.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import ActivityLog from '../models/ActivityLog.js';

// Helper: Get current task count for a member
const getMemberTaskCount = async (memberId) => {
  return await Task.countDocuments({
    assignedTo: memberId,
    status: { $ne: 'done' },
  });
};

// @desc    Create new task + Assignment logic
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo, priority, status } = req.body;

  try {
    const project = await Project.findById(projectId).populate('team');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.team.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let finalAssignee = assignedTo;

    // If assignedTo is provided, check overload
    if (assignedTo && assignedTo !== 'unassigned') {
      const member = await TeamMember.findById(assignedTo);
      if (!member) return res.status(404).json({ message: 'Member not found' });

      const currentTasks = await getMemberTaskCount(assignedTo);
      if (currentTasks >= member.capacity) {
        return res.status(400).json({
          message: 'overcapacity',
          warning: `${member.name} has ${currentTasks} tasks but capacity is ${member.capacity}. Assign anyway?`,
          memberId: assignedTo,
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: finalAssignee === 'unassigned' ? null : finalAssignee,
      priority: priority || 'medium',
      status: status || 'pending',
    });

    await task.populate('assignedTo', 'name');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks (with filters)
// @route   GET /api/tasks?projectId=xxx&memberId=xxx
// @access  Private
export const getTasks = async (req, res) => {
  const { projectId, memberId } = req.query;

  try {
    const filter = {};
    if (projectId) filter.project = projectId;
    if (memberId) filter.assignedTo = memberId === 'unassigned' ? null : memberId;

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reassign Tasks (Main Button Logic)
// @route   POST /api/tasks/reassign
// @access  Private
export const reassignTasks = async (req, res) => {
  const { teamId } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team || team.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const members = await TeamMember.find({ team: teamId });
    const memberLoad = {};

    // Calculate current load
    for (const member of members) {
      const count = await getMemberTaskCount(member._id);
      memberLoad[member._id] = { member, count };
    }

    const overloaded = Object.values(memberLoad).filter(m => m.count >= m.member.capacity);
    const underloaded = Object.values(memberLoad)
      .filter(m => m.count < m.member.capacity)
      .sort((a, b) => a.count - b.count); // Least loaded first

    const logs = [];

    for (const overload of overloaded) {
      const extraTasks = await Task.find({
        assignedTo: overload.member._id,
        priority: { $in: ['low', 'medium'] },
        status: { $ne: 'done' },
      }).sort({ priority: 1 }); // low first

      for (const task of extraTasks) {
        if (underloaded.length === 0) break;

        const target = underloaded[0];
        if (target.count >= target.member.capacity) {
          underloaded.shift();
          continue;
        }

        // Reassign
        const oldAssignee = await TeamMember.findById(task.assignedTo);
        await Task.findByIdAndUpdate(task._id, { assignedTo: target.member._id });

        // Create log
        const log = await ActivityLog.create({
          task: task._id,
          taskTitle: task.title,
          fromMember: oldAssignee._id,
          fromName: oldAssignee.name,
          toMember: target.member._id,
          toName: target.member.name,
          message: `Task "${task.title}" reassigned from ${oldAssignee.name} to ${target.member.name}`,
        });

        logs.push(log);

        target.count++;
        if (target.count >= target.member.capacity) underloaded.shift();
      }
    }

    const recentLogs = await ActivityLog.find({ task: { $in: logs.map(l => l.task) } })
      .populate('fromMember toMember', 'name')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({ message: 'Reassignment completed', logs: recentLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team load (for dropdown & dashboard)
// @route   GET /api/tasks/team-load/:teamId
export const getTeamLoad = async (req, res) => {
  const { teamId } = req.params;

  try {
    const members = await TeamMember.find({ team: teamId });
    const load = [];

    for (const member of members) {
      const current = await getMemberTaskCount(member._id);
      load.push({
        _id: member._id,
        name: member.name,
        role: member.role,
        currentTasks: current,
        capacity: member.capacity,
        isOverloaded: current > member.capacity,
      });
    }

    res.json(load.sort((a, b) => a.currentTasks - b.currentTasks));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};