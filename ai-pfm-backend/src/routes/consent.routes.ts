import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { auditSensitiveOperation } from "../middlewares/auditMiddleware";
import consentController from "../controllers/consent.controller";

const router = Router();

/**
 * Consent Management Routes
 * All routes require authentication
 */

// Grant consent
router.post(
  "/grant",
  authenticateToken,
  auditSensitiveOperation("CONSENT_GRANT", "consent"),
  (req, res) => consentController.grantConsent(req, res),
);

// Revoke consent
router.post(
  "/revoke",
  authenticateToken,
  auditSensitiveOperation("CONSENT_REVOKE", "consent"),
  (req, res) => consentController.revokeConsent(req, res),
);

// Get user's consents
router.get("/", authenticateToken, (req, res) =>
  consentController.getUserConsents(req, res),
);

// Check specific consent status
router.get("/check/:consentType", authenticateToken, (req, res) =>
  consentController.checkConsent(req, res),
);

// Get consent statistics (admin only - TODO: add admin middleware)
router.get("/statistics", authenticateToken, (req, res) =>
  consentController.getStatistics(req, res),
);

export default router;
