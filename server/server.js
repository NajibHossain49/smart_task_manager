import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "Smart Task Manager API is running!" });
});

// API Routes
app.use("/api/auth", authRoutes);

// 404 Handler (For all routes)
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Server Listen
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
