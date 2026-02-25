import express from "express";
import chatCoachRoutes from "./routes/chatCoach.routes";

const app = express();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/coach", chatCoachRoutes);

export default app;
