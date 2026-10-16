import { Router, Response } from "express";
import { authenticateToken, AuthRequest } from "../middlewares/authMiddleware";
import { ForecastService } from "../services/forecast.service";

const router = Router();
const forecastService = new ForecastService();

router.use(authenticateToken);

// GET /api/analytics/forecast
router.get("/forecast", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const forecast = await forecastService.getNextMonthForecast(userId);
    res.json({ forecast });
  } catch (error) {
    console.error("Error generating forecast:", error);
    res.status(500).json({ error: "Failed to generate forecast" });
  }
});

export default router;
