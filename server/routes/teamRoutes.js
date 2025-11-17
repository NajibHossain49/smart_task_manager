import express from "express";
import {
  addMember,
  createTeam,
  getTeamLoad,
  getTeams,
  suggestAssignee,
} from "../controllers/teamController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createTeam).get(protect, getTeams);

router.post("/:teamId/members", protect, addMember);
router.get("/:teamId/load", protect, getTeamLoad);
router.get("/:teamId/suggest-assignee", protect, suggestAssignee);

export default router;
