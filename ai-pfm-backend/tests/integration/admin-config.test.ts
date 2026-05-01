/**
 * Admin Configuration API - Integration Tests
 * Tests all CRUD operations and features
 */

import mongoose from "mongoose";
import AdminConfig, { IAdminConfig } from "../../src/schemas/admin_config.schema";
import adminConfigService from "../../src/services/admin-config.service";
import dotenv from "dotenv";

dotenv.config();

describe("Admin Configuration API - Integration Tests", () => {
  // Test data
  let testConfigId: string;
  const testConfig: Partial<IAdminConfig> = {
    configKey: "test_max_recommendations",
    configType: "threshold",
    description: "Test maximum recommendations threshold",
    value: 5,
    thresholds: {
      min: 1,
      max: 10,
      warning: 7,
      critical: 9,
    },
    isActive: true,
  };

  const updatedConfig: Partial<IAdminConfig> = {
    value: 10,
    thresholds: {
      min: 1,
      max: 15,
      warning: 12,
      critical: 14,
    },
  };

  // Connect to test database
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_TEST_URI || "mongodb://localhost:27017/ai-pfm-test";
    await mongoose.connect(mongoUri);
    console.log("Connected to test database");
  });

  // Clean up test database
  afterAll(async () => {
    await AdminConfig.deleteMany({ configKey: { $regex: "^test_" } });
    await mongoose.connection.close();
    console.log("Disconnected from test database");
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("CREATE - Create Configuration", () => {
    it("should create a new configuration", async () => {
      const config = await adminConfigService.createConfig(testConfig, "test_admin");

      expect(config).toBeDefined();
      expect(config.configKey).toBe(testConfig.configKey);
      expect(config.configType).toBe(testConfig.configType);
      expect(config.value).toBe(testConfig.value);
      expect(config.isActive).toBe(true);
      expect(config.version).toBe("1.0");
      expect(config.createdBy).toBe("test_admin");

      testConfigId = config._id?.toString() || "";
    });

    it("should fail to create duplicate configuration", async () => {
      try {
        await adminConfigService.createConfig(testConfig, "test_admin");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should create configuration with localization", async () => {
      const localizedConfig: Partial<IAdminConfig> = {
        configKey: "test_localized_config",
        configType: "recommendation",
        description: "Test localized configuration",
        value: true,
        localization: {
          en: { title: "English Title", description: "English Description" },
          si: { title: "සිංහල ශීර්ෂ", description: "සිංහල විස්තරණ" },
          ta: { title: "தமிழ் தலைப்பு", description: "தமிழ் விளக்கம்" },
        },
        isActive: true,
      };

      const config = await adminConfigService.createConfig(localizedConfig, "test_admin");
      expect(config.localization).toBeDefined();
      expect(config.localization?.en?.title).toBe("English Title");
    });

    it("should create configuration with customer segments", async () => {
      const segmentedConfig: Partial<IAdminConfig> = {
        configKey: "test_segmented_config",
        configType: "recommendation",
        description: "Test segmented configuration",
        value: true,
        customerSegments: ["premium", "standard"],
        isEnabledBySegment: {
          premium: true,
          standard: true,
          basic: false,
        },
        isActive: true,
      };

      const config = await adminConfigService.createConfig(segmentedConfig, "test_admin");
      expect(config.customerSegments).toContain("premium");
      expect(config.customerSegments).toContain("standard");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("READ - Get Configurations", () => {
    it("should get configuration by key", async () => {
      const config = await adminConfigService.getConfig(testConfig.configKey!);

      expect(config).toBeDefined();
      expect(config?.configKey).toBe(testConfig.configKey);
      expect(config?.value).toBe(testConfig.value);
    });

    it("should return null for non-existent configuration", async () => {
      const config = await adminConfigService.getConfig("non_existent_key");
      expect(config).toBeNull();
    });

    it("should get configuration value", async () => {
      const value = await adminConfigService.getConfigValue<number>(
        testConfig.configKey!,
        0
      );

      expect(value).toBe(testConfig.value);
    });

    it("should get configurations by type", async () => {
      const configs = await adminConfigService.getConfigsByType("threshold");
      expect(configs).toBeDefined();
      expect(Array.isArray(configs)).toBe(true);
      expect(configs.length).toBeGreaterThan(0);
    });

    it("should filter active configurations only", async () => {
      const allConfigs = await adminConfigService.getConfigsByType("threshold", false);
      const activeConfigs = await adminConfigService.getConfigsByType("threshold", true);

      expect(activeConfigs.length).toBeLessThanOrEqual(allConfigs.length);
    });

    it("should get recommendation configurations", async () => {
      const configs = await adminConfigService.getRecommendationConfigs();
      expect(Array.isArray(configs)).toBe(true);
    });

    it("should get recommendation configurations by type", async () => {
      const configs = await adminConfigService.getRecommendationConfigs("BUDGET");
      expect(Array.isArray(configs)).toBe(true);
      configs.forEach((config) => {
        expect(config.recommendationType).toBe("BUDGET");
      });
    });

    it("should get threshold value from configuration", async () => {
      const warningThreshold = await adminConfigService.getThreshold(
        testConfig.configKey!,
        "warning"
      );

      expect(warningThreshold).toBe(7);
    });

    it("should get localized text", async () => {
      const enText = await adminConfigService.getLocalizedText("test_localized_config", "en");
      expect(enText).toBeDefined();
      expect(enText?.title).toBe("English Title");
    });

    it("should get customer segments", async () => {
      const segments = await adminConfigService.getCustomerSegments();
      expect(Array.isArray(segments)).toBe(true);
      expect(segments.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("UPDATE - Update Configuration", () => {
    it("should update configuration value", async () => {
      const updated = await adminConfigService.updateConfig(
        testConfig.configKey!,
        updatedConfig,
        "test_admin"
      );

      expect(updated).toBeDefined();
      expect(updated?.value).toBe(updatedConfig.value);
      expect(updated?.modifiedBy).toBe("test_admin");
    });

    it("should increment version on value change", async () => {
      const config = await adminConfigService.getConfig(testConfig.configKey!);
      expect(config?.version).not.toBe("1.0");
      expect(config?.version).toBe("1.1");
    });

    it("should maintain previous versions history", async () => {
      const config = await adminConfigService.getConfig(testConfig.configKey!);
      expect(config?.previousVersions).toBeDefined();
      expect(config?.previousVersions?.length).toBeGreaterThan(0);
    });

    it("should return null for non-existent configuration", async () => {
      const updated = await adminConfigService.updateConfig(
        "non_existent_key",
        updatedConfig,
        "test_admin"
      );

      expect(updated).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("TOGGLE - Enable/Disable Configuration", () => {
    it("should disable configuration", async () => {
      const toggled = await adminConfigService.toggleConfig(
        testConfig.configKey!,
        false,
        "test_admin"
      );

      expect(toggled).toBeDefined();
      expect(toggled?.isActive).toBe(false);
    });

    it("should enable configuration", async () => {
      const toggled = await adminConfigService.toggleConfig(
        testConfig.configKey!,
        true,
        "test_admin"
      );

      expect(toggled).toBeDefined();
      expect(toggled?.isActive).toBe(true);
    });

    it("disabled configuration should not be returned by getConfig", async () => {
      await adminConfigService.toggleConfig(testConfig.configKey!, false, "test_admin");
      const config = await adminConfigService.getConfig(testConfig.configKey!);

      expect(config).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("HISTORY - Configuration History", () => {
    beforeAll(async () => {
      // Re-enable the config
      await adminConfigService.toggleConfig(testConfig.configKey!, true, "test_admin");
    });

    it("should get configuration history", async () => {
      const history = await adminConfigService.getConfigHistory(testConfig.configKey!);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it("history should contain version entries", async () => {
      const history = await adminConfigService.getConfigHistory(testConfig.configKey!);

      history.forEach((entry) => {
        expect(entry.version).toBeDefined();
        expect(entry.value).toBeDefined();
        expect(entry.modifiedAt).toBeDefined();
        expect(entry.modifiedBy).toBeDefined();
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("SEARCH - Search Configurations", () => {
    it("should search by configuration key", async () => {
      const results = await adminConfigService.searchConfigs("max_recommendations");

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.configKey.includes("max_recommendations"))).toBe(true);
    });

    it("should search by description", async () => {
      const results = await adminConfigService.searchConfigs("Test");

      expect(Array.isArray(results)).toBe(true);
    });

    it("should filter search results by type", async () => {
      const results = await adminConfigService.searchConfigs("test", {
        configType: "threshold",
      });

      results.forEach((config) => {
        expect(config.configType).toBe("threshold");
      });
    });

    it("should filter search results by active status", async () => {
      const results = await adminConfigService.searchConfigs("test", {
        isActive: true,
      });

      results.forEach((config) => {
        expect(config.isActive).toBe(true);
      });
    });

    it("should handle multiple search filters", async () => {
      const results = await adminConfigService.searchConfigs("test", {
        configType: "threshold",
        isActive: true,
      });

      results.forEach((config) => {
        expect(config.configType).toBe("threshold");
        expect(config.isActive).toBe(true);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("STATISTICS - Configuration Statistics", () => {
    it("should get configuration statistics", async () => {
      const stats = await adminConfigService.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.active).toBeGreaterThan(0);
      expect(stats.byType).toBeDefined();
    });

    it("statistics should include all configuration types", async () => {
      const stats = await adminConfigService.getStatistics();

      expect(stats.byType).toHaveProperty("threshold");
      expect(stats.byType.threshold).toBeGreaterThan(0);
    });

    it("active + inactive should equal total", async () => {
      const stats = await adminConfigService.getStatistics();
      expect(stats.active + stats.inactive).toBe(stats.total);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("DELETE - Delete Configuration", () => {
    it("should delete configuration (soft delete)", async () => {
      const deleted = await adminConfigService.deleteConfig(testConfig.configKey!, "test_admin");
      expect(deleted).toBe(true);
    });

    it("deleted configuration should not be retrievable", async () => {
      const config = await adminConfigService.getConfig(testConfig.configKey!);
      expect(config).toBeNull();
    });

    it("should return false for non-existent configuration", async () => {
      const deleted = await adminConfigService.deleteConfig("non_existent_key", "test_admin");
      expect(deleted).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("VALIDATION - Error Handling", () => {
    it("should require configKey", async () => {
      try {
        await adminConfigService.createConfig(
          {
            configType: "threshold",
            description: "Test",
            value: 5,
            isActive: true,
          },
          "test_admin"
        );
        fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should require value", async () => {
      try {
        await adminConfigService.createConfig(
          {
            configKey: "test_invalid",
            configType: "threshold",
            description: "Test",
            isActive: true,
          },
          "test_admin"
        );
        fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────

  describe("BULK OPERATIONS - Bulk Update by Category", () => {
    beforeAll(async () => {
      // Create test configs with category
      const testConfigs = [
        {
          configKey: "test_cat_config_1",
          configType: "threshold",
          description: "Test category config 1",
          value: 1,
          category: "test_category",
          isActive: true,
        },
        {
          configKey: "test_cat_config_2",
          configType: "threshold",
          description: "Test category config 2",
          value: 2,
          category: "test_category",
          isActive: true,
        },
      ];

      for (const config of testConfigs) {
        await adminConfigService.createConfig(config, "test_admin");
      }
    });

    it("should bulk update configurations by category", async () => {
      const updatedCount = await adminConfigService.bulkUpdateByCategory(
        "test_category",
        { description: "Updated description" },
        "test_admin"
      );

      expect(updatedCount).toBeGreaterThan(0);
    });
  });
});
