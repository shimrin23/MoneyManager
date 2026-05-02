import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  auditDataAccess,
  auditDataModification,
} from "../middlewares/auditMiddleware";
import adminConfigController from "../controllers/admin-config.controller";

const router = Router();

/**
 * Admin Configuration Routes
 * NOTE: Specific routes must come before generic :configKey parameter routes
 * All routes require authentication (TODO: add admin role check)
 */

// Create configuration
router.post(
  "/",
  authenticateToken,
  auditDataModification("CREATE", "admin_config"),
  (req, res) => adminConfigController.createConfig(req, res),
);

// ─── Specific GET routes (must come BEFORE /:configKey) ───────────────────
// Search configurations
router.get("/search/query", authenticateToken, (req, res) =>
  adminConfigController.searchConfigs(req, res),
);

// Get configurations by type
router.get("/type/:configType", authenticateToken, (req, res) =>
  adminConfigController.getConfigsByType(req, res),
);

// Get recommendation configurations
router.get("/recommendations/list", authenticateToken, (req, res) =>
  adminConfigController.getRecommendationConfigs(req, res),
);

// Get customer segments
router.get("/segments/list", authenticateToken, (req, res) =>
  adminConfigController.getCustomerSegments(req, res),
);

// Get statistics
router.get("/statistics/overview", authenticateToken, (req, res) =>
  adminConfigController.getStatistics(req, res),
);

// ─── Generic :configKey routes (after specific routes) ───────────────────
// Get configuration history
router.get("/:configKey/history", authenticateToken, (req, res) =>
  adminConfigController.getHistory(req, res),
);

// Toggle configuration status
router.patch(
  "/:configKey/toggle",
  authenticateToken,
  auditDataModification("UPDATE", "admin_config"),
  (req, res) => adminConfigController.toggleConfig(req, res),
);

// Update configuration
router.put(
  "/:configKey",
  authenticateToken,
  auditDataModification("UPDATE", "admin_config"),
  (req, res) => adminConfigController.updateConfig(req, res),
);

// Get configuration by key
router.get(
  "/:configKey",
  authenticateToken,
  auditDataAccess("admin_config"),
  (req, res) => adminConfigController.getConfig(req, res),
);

// Delete configuration
router.delete(
  "/:configKey",
  authenticateToken,
  auditDataModification("DELETE", "admin_config"),
  (req, res) => adminConfigController.deleteConfig(req, res),
);

export default router;
