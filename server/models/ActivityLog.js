import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  taskTitle: String, // Cache title for display
  fromMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember",
  },
  fromName: String,
  toMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember",
  },
  toName: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
