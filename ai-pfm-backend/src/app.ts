import express from "express";
import chatCoachRoutes from "./routes/chatCoach.routes";

const app = express();

// Parse JSON request bodies for API routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/coach", chatCoachRoutes);

export default app;
