import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// I will calculate currentTasks dynamically later in queries
// For now, no field for it

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;
