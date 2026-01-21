import AdminConfig, { IAdminConfig } from "../schemas/admin_config.schema";
import { createAuditLog } from "../middlewares/auditMiddleware";
import { Request } from "express";

/**
 * Admin Configuration Service - BRD Section 2.4 (Administrative Portal Controls)
 * Manages system-wide configurations for PFM features
 */
export class AdminConfigService {
  /**
   * Create a new configuration
   */
  async createConfig(
    configData: Partial<IAdminConfig>,
    createdBy: string,
    request?: Request,
  ): Promise<IAdminConfig> {
    const config = new AdminConfig({
      ...configData,
      createdBy,
      version: "1.0",
    });

    await config.save();

    // Audit log
    if (request) {
      await createAuditLog(
        createdBy,
        {
          action: "CONFIG_CREATED",
          resourceType: "admin_config",
          resourceId: config._id.toString(),
          severity: "medium",
          metadata: { configKey: config.configKey },
        },
        request,
        "success",
      );
    }

    return config;
  }

  /**
   * Update configuration
   */
  async updateConfig(
    configKey: string,
    updates: Partial<IAdminConfig>,
    modifiedBy: string,
    request?: Request,
  ): Promise<IAdminConfig | null> {
    const config = await AdminConfig.findOne({ configKey });

    if (!config) return null;

    const before = config.toObject();

    Object.assign(config, updates);
    config.modifiedBy = modifiedBy;

    await config.save();

    // Audit log with changes
    if (request) {
      await createAuditLog(
        modifiedBy,
        {
          action: "CONFIG_UPDATED",
          resourceType: "admin_config",
          resourceId: config._id.toString(),
          severity: "medium",
          changes: {
            before: before.value,
            after: config.value,
            fields: Object.keys(updates),
          },
          metadata: { configKey },
        },
        request,
        "success",
      );
    }

    return config;
  }

  /**
   * Get configuration by key
   */
  async getConfig(configKey: string): Promise<IAdminConfig | null> {
    return await AdminConfig.findOne({ configKey, isActive: true });
  }

  /**
   * Get configuration value (convenience method)
   */
  async getConfigValue<T = any>(
    configKey: string,
    defaultValue?: T,
  ): Promise<T | undefined> {
    const config = await this.getConfig(configKey);
    return config ? config.value : defaultValue;
  }

  /**
   * Get all configurations by type
   */
  async getConfigsByType(
    configType: IAdminConfig["configType"],
    activeOnly: boolean = true,
  ): Promise<IAdminConfig[]> {
    const query: any = { configType };
    if (activeOnly) query.isActive = true;

    return await AdminConfig.find(query).sort({ priority: -1, configKey: 1 });
  }

  /**
   * Get recommendation configurations
   */
  async getRecommendationConfigs(
    recommendationType?: IAdminConfig["recommendationType"],
    customerSegment?: string,
  ): Promise<IAdminConfig[]> {
    const query: any = {
      configType: "recommendation",
      isActive: true,
    };

    if (recommendationType) {
      query.recommendationType = recommendationType;
    }

    const configs = await AdminConfig.find(query).sort({ priority: -1 });

    // Filter by customer segment if provided
    if (customerSegment) {
      return configs.filter((config) => {
        if (!config.isEnabledBySegment) return true;
        const segmentMap = config.isEnabledBySegment as unknown as Map<
          string,
          boolean
        >;
        const isEnabled = segmentMap.get(customerSegment);
        return isEnabled !== false;
      });
    }

    return configs;
  }

  /**
   * Get threshold configuration
   */
  async getThreshold(
    configKey: string,
    thresholdType: "min" | "max" | "warning" | "critical",
  ): Promise<number | undefined> {
    const config = await this.getConfig(configKey);
    return config?.thresholds?.[thresholdType];
  }

  /**
   * Get localized text
   */
  async getLocalizedText(
    configKey: string,
    language: "en" | "si" | "ta" = "en",
  ): Promise<{
    title?: string;
    description?: string;
    template?: string;
  } | null> {
    const config = await this.getConfig(configKey);
    return config?.localization?.[language] || null;
  }

  /**
   * Toggle configuration active status
   */
  async toggleConfig(
    configKey: string,
    isActive: boolean,
    modifiedBy: string,
    request?: Request,
  ): Promise<IAdminConfig | null> {
    const config = await AdminConfig.findOneAndUpdate(
      { configKey },
      { isActive, modifiedBy },
      { new: true },
    );

    if (config && request) {
      await createAuditLog(
        modifiedBy,
        {
          action: isActive ? "CONFIG_ENABLED" : "CONFIG_DISABLED",
          resourceType: "admin_config",
          resourceId: config._id.toString(),
          severity: "medium",
          metadata: { configKey },
        },
        request,
        "success",
      );
    }

    return config;
  }

  /**
   * Get configuration history
   */
  async getConfigHistory(
    configKey: string,
  ): Promise<IAdminConfig["previousVersions"]> {
    const config = await AdminConfig.findOne({ configKey });
    return config?.previousVersions || [];
  }

  /**
   * Bulk update configurations by category
   */
  async bulkUpdateByCategory(
    category: string,
    updates: Partial<IAdminConfig>,
    modifiedBy: string,
  ): Promise<number> {
    const result = await AdminConfig.updateMany(
      { category },
      { ...updates, modifiedBy },
    );

    return result.modifiedCount;
  }

  /**
   * Search configurations
   */
  async searchConfigs(
    searchTerm: string,
    filters?: {
      configType?: IAdminConfig["configType"];
      isActive?: boolean;
      tags?: string[];
    },
  ): Promise<IAdminConfig[]> {
    const query: any = {
      $or: [
        { configKey: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    };

    if (filters) {
      if (filters.configType) query.configType = filters.configType;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
    }

    return await AdminConfig.find(query).sort({ configKey: 1 });
  }

  /**
   * Get all customer segments
   */
  async getCustomerSegments(): Promise<string[]> {
    const configs = await AdminConfig.find({
      customerSegments: { $exists: true, $ne: [] },
    });

    const segments = new Set<string>();
    configs.forEach((config) => {
      config.customerSegments?.forEach((seg) => segments.add(seg));
    });

    return Array.from(segments).sort();
  }

  /**
   * Delete configuration (soft delete by setting inactive)
   */
  async deleteConfig(
    configKey: string,
    deletedBy: string,
    request?: Request,
  ): Promise<boolean> {
    const result = await this.toggleConfig(
      configKey,
      false,
      deletedBy,
      request,
    );
    return !!result;
  }

  /**
   * Get statistics for admin dashboard
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  }> {
    const [total, active, inactive, byType] = await Promise.all([
      AdminConfig.countDocuments(),
      AdminConfig.countDocuments({ isActive: true }),
      AdminConfig.countDocuments({ isActive: false }),
      AdminConfig.aggregate([
        { $group: { _id: "$configType", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      active,
      inactive,
      byType: Object.fromEntries(byType.map((item) => [item._id, item.count])),
    };
  }
}

export default new AdminConfigService();
