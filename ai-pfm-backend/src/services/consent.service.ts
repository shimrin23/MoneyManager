import Consent, { IConsent } from "../schemas/consent.schema";
import { createAuditLog } from "../middlewares/auditMiddleware";
import { Request } from "express";

/**
 * Consent Management Service - BRD Section 2.1 (Compliance & Consent)
 * Handles customer opt-in/opt-out for PFM features
 */
export class ConsentService {
  /**
   * Grant consent for a specific type
   */
  async grantConsent(
    userId: string,
    consentType: IConsent["consentType"],
    version: string,
    request?: Request,
    expiresInDays?: number,
  ): Promise<IConsent> {
    // Revoke any existing active consent of the same type
    await this.revokeConsent(userId, consentType);

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const consent = new Consent({
      userId,
      consentType,
      status: "granted",
      version,
      grantedAt: new Date(),
      expiresAt,
      ipAddress: request?.ip || request?.socket.remoteAddress,
      userAgent: request?.headers["user-agent"],
      metadata: {
        source: request ? "web" : "system",
      },
    });

    await consent.save();

    // Audit log
    if (request) {
      await createAuditLog(
        userId,
        {
          action: "CONSENT_GRANTED",
          resourceType: "consent",
          resourceId: consent._id.toString(),
          severity: "high",
          metadata: { consentType, version },
        },
        request,
        "success",
      );
    }

    return consent;
  }

  /**
   * Revoke consent
   */
  async revokeConsent(
    userId: string,
    consentType: IConsent["consentType"],
    request?: Request,
  ): Promise<void> {
    const result = await Consent.updateMany(
      {
        userId,
        consentType,
        status: "granted",
      },
      {
        status: "revoked",
        revokedAt: new Date(),
      },
    );

    // Audit log
    if (request) {
      await createAuditLog(
        userId,
        {
          action: "CONSENT_REVOKED",
          resourceType: "consent",
          severity: "high",
          metadata: { consentType, count: result.modifiedCount },
        },
        request,
        "success",
      );
    }
  }

  /**
   * Check if user has active consent for a specific type
   */
  async hasActiveConsent(
    userId: string,
    consentType: IConsent["consentType"],
  ): Promise<boolean> {
    const consent = await Consent.findOne({
      userId,
      consentType,
      status: "granted",
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    });

    return !!consent;
  }

  /**
   * Get all consents for a user
   */
  async getUserConsents(userId: string): Promise<IConsent[]> {
    return await Consent.find({ userId }).sort({ grantedAt: -1 });
  }

  /**
   * Get active consents for a user
   */
  async getActiveConsents(userId: string): Promise<IConsent[]> {
    return await Consent.find({
      userId,
      status: "granted",
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    });
  }

  /**
   * Check if PFM analysis is allowed (required for all PFM features)
   */
  async canAnalyzeFinancialData(userId: string): Promise<boolean> {
    return await this.hasActiveConsent(userId, "pfm_analysis");
  }

  /**
   * Expire old consents (run as a scheduled job)
   */
  async expireOldConsents(): Promise<number> {
    const result = await Consent.updateMany(
      {
        status: "granted",
        expiresAt: { $lt: new Date() },
      },
      {
        status: "expired",
      },
    );

    return result.modifiedCount;
  }

  /**
   * Bulk grant consents (for migration or batch operations)
   */
  async bulkGrantConsent(
    userIds: string[],
    consentType: IConsent["consentType"],
    version: string,
  ): Promise<number> {
    const consents = userIds.map((userId) => ({
      userId,
      consentType,
      status: "granted",
      version,
      grantedAt: new Date(),
      metadata: { source: "bulk_migration" },
    }));

    const result = await Consent.insertMany(consents);
    return result.length;
  }

  /**
   * Get consent statistics (for admin dashboard)
   */
  async getConsentStatistics(): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const [byType, byStatus, total] = await Promise.all([
      Consent.aggregate([
        { $group: { _id: "$consentType", count: { $sum: 1 } } },
      ]),
      Consent.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Consent.countDocuments(),
    ]);

    return {
      total,
      byType: Object.fromEntries(byType.map((item) => [item._id, item.count])),
      byStatus: Object.fromEntries(
        byStatus.map((item) => [item._id, item.count]),
      ),
    };
  }
}

export default new ConsentService();
