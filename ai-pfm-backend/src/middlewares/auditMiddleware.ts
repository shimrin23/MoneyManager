import { Request, Response, NextFunction } from "express";
import AuditLog from "../schemas/audit_log.schema";
import { AuthRequest } from "./authMiddleware";

/**
 * Audit Logging Middleware - BRD Section 2.4 (Auditability)
 * Logs all sensitive operations for compliance and security
 */

export interface AuditMetadata {
  action: string;
  resourceType:
    | "transaction"
    | "recommendation"
    | "consent"
    | "user"
    | "goal"
    | "loan"
    | "admin_config";
  resourceId?: string;
  severity?: "low" | "medium" | "high" | "critical";
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };
  metadata?: any;
}

/**
 * Helper function to create audit log entry
 */
export const createAuditLog = async (
  userId: string | undefined,
  metadata: AuditMetadata,
  request: Request,
  status: "success" | "failure" | "warning" = "success",
  error?: any,
): Promise<void> => {
  try {
    const auditEntry = new AuditLog({
      userId,
      action: metadata.action,
      resourceType: metadata.resourceType,
      resourceId: metadata.resourceId,
      status,
      severity: metadata.severity || "low",
      requestMetadata: {
        ipAddress: request.ip || request.socket.remoteAddress,
        userAgent: request.headers["user-agent"],
        endpoint: request.path,
        method: request.method,
        requestId: (request as any).requestId,
      },
      changes: metadata.changes,
      error: error
        ? {
            message: error.message,
            code: error.code,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
          }
        : undefined,
      metadata: metadata.metadata,
      timestamp: new Date(),
    });

    await auditEntry.save();
  } catch (err) {
    // Don't throw - audit failures shouldn't break the application
    console.error("Failed to create audit log:", err);
  }
};

/**
 * Middleware to automatically audit sensitive operations
 */
export const auditMiddleware = (
  action: string,
  resourceType: AuditMetadata["resourceType"],
  severity: AuditMetadata["severity"] = "medium",
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const startTime = Date.now();

    // Store original body for audit
    const originalBody = { ...req.body };

    // Override res.send to capture response
    res.send = function (data: any): Response {
      const responseTime = Date.now() - startTime;

      // Determine status based on status code
      let auditStatus: "success" | "failure" | "warning" = "success";
      if (res.statusCode >= 400) {
        auditStatus = res.statusCode >= 500 ? "failure" : "warning";
      }

      // Create audit log asynchronously (don't block response)
      setImmediate(async () => {
        await createAuditLog(
          req.user?.userId || req.user?.id,
          {
            action,
            resourceType,
            resourceId: req.params.id || req.body.id,
            severity,
            metadata: {
              responseTime,
              statusCode: res.statusCode,
              requestBody: sanitizeData(originalBody),
            },
          },
          req,
          auditStatus,
        );
      });

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Sanitize sensitive data from logs
 */
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== "object") return data;

  const sensitiveFields = [
    "password",
    "passwordHash",
    "token",
    "apiKey",
    "secret",
    "ssn",
    "creditCard",
  ];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "***REDACTED***";
    }
  }

  return sanitized;
};

/**
 * Middleware specifically for tracking data access (READ operations)
 */
export const auditDataAccess = (
  resourceType: AuditMetadata["resourceType"],
) => {
  return auditMiddleware("DATA_ACCESS", resourceType, "low");
};

/**
 * Middleware for tracking data modifications (CREATE/UPDATE/DELETE)
 */
export const auditDataModification = (
  action: "CREATE" | "UPDATE" | "DELETE",
  resourceType: AuditMetadata["resourceType"],
) => {
  return auditMiddleware(`DATA_${action}`, resourceType, "medium");
};

/**
 * Middleware for tracking sensitive operations (CONSENT, RECOMMENDATION_EXECUTION)
 */
export const auditSensitiveOperation = (
  action: string,
  resourceType: AuditMetadata["resourceType"],
) => {
  return auditMiddleware(action, resourceType, "high");
};

export default {
  auditMiddleware,
  auditDataAccess,
  auditDataModification,
  auditSensitiveOperation,
  createAuditLog,
};
