import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import consentService from "../services/consent.service";

/**
 * Consent Check Middleware - Ensures user has granted required consent
 * BRD Section 2.1: "All data analysis requires explicit customer opt-in"
 */

/**
 * Middleware to check if user has granted PFM analysis consent
 * Use this on all PFM feature endpoints (recommendations, financial health, etc.)
 */
export const requirePFMConsent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      res.status(401).json({
        error: "User not authenticated",
      });
      return;
    }

    const hasConsent = await consentService.hasActiveConsent(
      userId,
      "pfm_analysis",
    );

    if (!hasConsent) {
      res.status(403).json({
        error: "PFM consent required",
        message: "You must grant consent for PFM analysis to use this feature",
        consentType: "pfm_analysis",
        action: "grant_consent_at",
        endpoint: "/api/consent/grant",
      });
      return;
    }

    // User has consent, proceed
    next();
  } catch (error) {
    console.error("Error checking PFM consent:", error);
    res.status(500).json({
      error: "Failed to verify consent",
    });
  }
};

/**
 * Middleware to check for data sharing consent
 */
export const requireDataSharingConsent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const hasConsent = await consentService.hasActiveConsent(
      userId,
      "data_sharing",
    );

    if (!hasConsent) {
      res.status(403).json({
        error: "Data sharing consent required",
        message: "You must grant consent for data sharing to use this feature",
        consentType: "data_sharing",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking data sharing consent:", error);
    res.status(500).json({ error: "Failed to verify consent" });
  }
};

/**
 * Generic consent checker - pass consent type as parameter
 */
export const requireConsent = (
  consentType: "pfm_analysis" | "data_sharing" | "marketing" | "third_party",
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const hasConsent = await consentService.hasActiveConsent(
        userId,
        consentType,
      );

      if (!hasConsent) {
        res.status(403).json({
          error: `${consentType} consent required`,
          message: `You must grant consent for ${consentType.replace(
            "_",
            " ",
          )} to use this feature`,
          consentType,
        });
        return;
      }

      next();
    } catch (error) {
      console.error(`Error checking ${consentType} consent:`, error);
      res.status(500).json({ error: "Failed to verify consent" });
    }
  };
};

export default {
  requirePFMConsent,
  requireDataSharingConsent,
  requireConsent,
};
