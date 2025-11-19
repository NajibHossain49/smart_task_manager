import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";

dotenv.config();

const app = express();

// Vercel-এর জন্য export করা লাগবে
if (process.env.VERCEL) {
  export default app;
}

const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://smart-task-manager-frontend.vercel.app"], // তোমার ফ্রন্টেন্ড URL যোগ করো
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Smart Task Manager API is running on Vercel! 🚀" });
});

// routes...
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activitylogs", activityLogRoutes);

app.use(notFound);
app.use(errorHandler);

// Local-এ চললে তবেই listen করবে (Vercel-এ করবে না)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}