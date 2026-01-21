import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import adminConfigService from "../services/admin-config.service";

/**
 * Admin Configuration Controller
 */
export class AdminConfigController {
  /**
   * Create configuration
   * POST /api/admin/config
   */
  async createConfig(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const createdBy = req.user?.userId || req.user?.id || "admin";
      const config = await adminConfigService.createConfig(
        req.body,
        createdBy,
        req,
      );

      return res.status(201).json({
        message: "Configuration created successfully",
        config,
      });
    } catch (error: any) {
      console.error("Error creating config:", error);
      return res.status(500).json({
        error: "Failed to create configuration",
        details: error.message,
      });
    }
  }

  /**
   * Update configuration
   * PUT /api/admin/config/:configKey
   */
  async updateConfig(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { configKey } = req.params;
      const modifiedBy = req.user?.userId || req.user?.id || "admin";

      const config = await adminConfigService.updateConfig(
        configKey,
        req.body,
        modifiedBy,
        req,
      );

      if (!config) {
        return res.status(404).json({ error: "Configuration not found" });
      }

      return res.status(200).json({
        message: "Configuration updated successfully",
        config,
      });
    } catch (error: any) {
      console.error("Error updating config:", error);
      return res.status(500).json({
        error: "Failed to update configuration",
        details: error.message,
      });
    }
  }

  /**
   * Get configuration by key
   * GET /api/admin/config/:configKey
   */
  async getConfig(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { configKey } = req.params;
      const config = await adminConfigService.getConfig(configKey);

      if (!config) {
        return res.status(404).json({ error: "Configuration not found" });
      }

      return res.status(200).json({ config });
    } catch (error: any) {
      console.error("Error fetching config:", error);
      return res.status(500).json({
        error: "Failed to fetch configuration",
        details: error.message,
      });
    }
  }

  /**
   * Get configurations by type
   * GET /api/admin/config/type/:configType
   */
  async getConfigsByType(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { configType } = req.params;
      const activeOnly = req.query.activeOnly !== "false";

      const configs = await adminConfigService.getConfigsByType(
        configType as any,
        activeOnly,
      );

      return res.status(200).json({ configs });
    } catch (error: any) {
      console.error("Error fetching configs by type:", error);
      return res.status(500).json({
        error: "Failed to fetch configurations",
        details: error.message,
      });
    }
  }

  /**
   * Get recommendation configurations
   * GET /api/admin/config/recommendations
   */
  async getRecommendationConfigs(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      const { recommendationType, customerSegment } = req.query;

      const configs = await adminConfigService.getRecommendationConfigs(
        recommendationType as any,
        customerSegment as string,
      );

      return res.status(200).json({ configs });
    } catch (error: any) {
      console.error("Error fetching recommendation configs:", error);
      return res.status(500).json({
        error: "Failed to fetch recommendation configurations",
        details: error.message,
      });
    }
  }

  /**
   * Toggle configuration status
   * PATCH /api/admin/config/:configKey/toggle
   */
  async toggleConfig(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { configKey } = req.params;
      const { isActive } = req.body;
      const modifiedBy = req.user?.userId || req.user?.id || "admin";

      const config = await adminConfigService.toggleConfig(
        configKey,
        isActive,
        modifiedBy,
        req,
      );

      if (!config) {
        return res.status(404).json({ error: "Configuration not found" });
      }

      return res.status(200).json({
        message: `Configuration ${
          isActive ? "enabled" : "disabled"
        } successfully`,
        config,
      });
    } catch (error: any) {
      console.error("Error toggling config:", error);
      return res.status(500).json({
        error: "Failed to toggle configuration",
        details: error.message,
      });
    }
  }

  /**
   * Get configuration history
   * GET /api/admin/config/:configKey/history
   */
  async getHistory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { configKey } = req.params;
      const history = await adminConfigService.getConfigHistory(configKey);

      return res.status(200).json({ history });
    } catch (error: any) {
      console.error("Error fetching config history:", error);
      return res.status(500).json({
        error: "Failed to fetch configuration history",
        details: error.message,
      });
    }
  }

  /**
   * Search configurations
   * GET /api/admin/config/search
   */
  async searchConfigs(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { q, configType, isActive, tags } = req.query;

      const configs = await adminConfigService.searchConfigs(q as string, {
        configType: configType as any,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        tags: tags ? (tags as string).split(",") : undefined,
      });

      return res.status(200).json({ configs });
    } catch (error: any) {
      console.error("Error searching configs:", error);
      return res.status(500).json({
        error: "Failed to search configurations",
        details: error.message,
      });
    }
  }

  /**
   * Get customer segments
   * GET /api/admin/config/segments
   */
  async getCustomerSegments(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      const segments = await adminConfigService.getCustomerSegments();
      return res.status(200).json({ segments });
    } catch (error: any) {
      console.error("Error fetching customer segments:", error);
      return res.status(500).json({
        error: "Failed to fetch customer segments",
        details: error.message,
      });
    }
  }

  /**
   * Get statistics
   * GET /api/admin/config/statistics
   */
  async getStatistics(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const stats = await adminConfigService.getStatistics();
      return res.status(200).json({ statistics: stats });
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      return res.status(500).json({
        error: "Failed to fetch statistics",
        details: error.message,
      });
    }
  }

  /**
   * Delete configuration
   * DELETE /api/admin/config/:configKey
   */
  async deleteConfig(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { configKey } = req.params;
      const deletedBy = req.user?.userId || req.user?.id || "admin";

      const success = await adminConfigService.deleteConfig(
        configKey,
        deletedBy,
        req,
      );

      if (!success) {
        return res.status(404).json({ error: "Configuration not found" });
      }

      return res.status(200).json({
        message: "Configuration deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting config:", error);
      return res.status(500).json({
        error: "Failed to delete configuration",
        details: error.message,
      });
    }
  }
}

export default new AdminConfigController();
