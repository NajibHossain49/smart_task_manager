import express from "express";
import {
  createTask,
  getTasks,
  getTeamLoad,
  reassignTasks,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.post("/reassign", protect, reassignTasks);
router.get("/team-load/:teamId", protect, getTeamLoad);

export default router;
