import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import consentService from "../services/consent.service";

/**
 * Consent Controller - Handles consent management endpoints
 */
export class ConsentController {
  /**
   * Grant consent
   * POST /api/consent/grant
   */
  async grantConsent(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { consentType, version, expiresInDays } = req.body;
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!consentType || !version) {
        return res.status(400).json({
          error: "consentType and version are required",
        });
      }

      const consent = await consentService.grantConsent(
        userId,
        consentType,
        version,
        req,
        expiresInDays,
      );

      return res.status(201).json({
        message: "Consent granted successfully",
        consent,
      });
    } catch (error: any) {
      console.error("Error granting consent:", error);
      return res.status(500).json({
        error: "Failed to grant consent",
        details: error.message,
      });
    }
  }

  /**
   * Revoke consent
   * POST /api/consent/revoke
   */
  async revokeConsent(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { consentType } = req.body;
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!consentType) {
        return res.status(400).json({ error: "consentType is required" });
      }

      await consentService.revokeConsent(userId, consentType, req);

      return res.status(200).json({
        message: "Consent revoked successfully",
      });
    } catch (error: any) {
      console.error("Error revoking consent:", error);
      return res.status(500).json({
        error: "Failed to revoke consent",
        details: error.message,
      });
    }
  }

  /**
   * Get user's consents
   * GET /api/consent
   */
  async getUserConsents(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const activeOnly = req.query.activeOnly === "true";

      const consents = activeOnly
        ? await consentService.getActiveConsents(userId)
        : await consentService.getUserConsents(userId);

      return res.status(200).json({ consents });
    } catch (error: any) {
      console.error("Error fetching consents:", error);
      return res.status(500).json({
        error: "Failed to fetch consents",
        details: error.message,
      });
    }
  }

  /**
   * Check specific consent status
   * GET /api/consent/check/:consentType
   */
  async checkConsent(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { consentType } = req.params;
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const hasConsent = await consentService.hasActiveConsent(
        userId,
        consentType as any,
      );

      return res.status(200).json({
        consentType,
        hasConsent,
      });
    } catch (error: any) {
      console.error("Error checking consent:", error);
      return res.status(500).json({
        error: "Failed to check consent",
        details: error.message,
      });
    }
  }

  /**
   * Get consent statistics (Admin only)
   * GET /api/consent/statistics
   */
  async getStatistics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      // TODO: Add admin authorization check
      const stats = await consentService.getConsentStatistics();
      return res.status(200).json({ statistics: stats });
    } catch (error: any) {
      console.error("Error fetching consent statistics:", error);
      return res.status(500).json({
        error: "Failed to fetch statistics",
        details: error.message,
      });
    }
  }
}

export default new ConsentController();
