import express from "express";
import {
  createProject,
  deleteProject,
  getMyProjects,
  getProjectById,
  updateProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.route("/").post(protect, createProject).get(protect, getMyProjects);

router
  .route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

export default router;
