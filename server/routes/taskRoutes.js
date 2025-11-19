import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  getTeamLoad,
  reassignTasks,
  updateTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.post("/reassign", protect, reassignTasks);
router.get("/team-load/:teamId", protect, getTeamLoad);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

export default router;
