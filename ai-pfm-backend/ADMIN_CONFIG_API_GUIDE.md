# Admin Configuration API - Implementation Guide

## Overview

The Admin Configuration API provides a complete system for managing global application configurations for the AI-powered Personal Financial Management (PFM) system. It supports multiple configuration types, multilingual content, customer segmentation, and comprehensive audit logging.

**Base URL:** `http://localhost:3000/api/admin/config`

**Authentication:** All endpoints require JWT Bearer token authentication

---

## Quick Start

### 1. Prerequisites

- Node.js 16+
- MongoDB running and accessible
- Environment variables configured (.env file)

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed Default Configurations

```bash
npm run seed:admin-config
```

This will create 8 default admin configurations:
- `realtime_ingestion_threshold` - Transaction ingestion threshold
- `budget_recommendation_enabled` - Budget recommendations
- `savings_goal_recommendation_enabled` - Savings goals
- `debt_optimization_enabled` - Debt optimization
- `subscription_cleanup_enabled` - Subscription management
- `health_score_weights` - Financial health score calculation
- `consent_expiry_days` - Consent expiry settings
- `anomaly_detection_threshold` - Anomaly detection threshold

### 4. Start the Server

```bash
npm run dev  # Development mode with hot reload
# or
npm start   # Production mode
```

---

## Configuration Types

### 1. **Recommendation** (recommendation)
Settings for AI-powered recommendations

**Fields:**
- `recommendationType` - BUDGET, SAVINGS_GOAL, DEBT_OPTIMIZATION, SUBSCRIPTION_CLEANUP, INVESTMENT
- `localization` - Multilingual titles and descriptions
- `customerSegments` - Which customer segments can use this
- `priority` - Display priority (higher = more important)

**Example:**
```json
{
  "configKey": "budget_recommendation_enabled",
  "configType": "recommendation",
  "recommendationType": "BUDGET",
  "value": true,
  "priority": 1,
  "localization": {
    "en": { "title": "Budget Optimization", "description": "..." },
    "si": { "title": "අයවැය ප්‍රශස්තකරණය", "description": "..." }
  },
  "customerSegments": ["premium", "standard", "basic"],
  "isActive": true
}
```

### 2. **Threshold** (threshold)
Numeric thresholds and limits

**Fields:**
- `value` - Primary value
- `thresholds.min` - Minimum value
- `thresholds.max` - Maximum value
- `thresholds.warning` - Warning threshold
- `thresholds.critical` - Critical threshold

**Example:**
```json
{
  "configKey": "realtime_ingestion_threshold",
  "configType": "threshold",
  "value": 50000,
  "thresholds": {
    "min": 10000,
    "max": 500000,
    "warning": 40000,
    "critical": 100000
  },
  "isActive": true
}
```

### 3. **Category** (category)
Category definitions and hierarchies

### 4. **Segment** (segment)
Customer segment rules and definitions

### 5. **Feature Flag** (feature_flag)
Enable/disable features or feature configurations

**Example:**
```json
{
  "configKey": "health_score_weights",
  "configType": "feature_flag",
  "value": {
    "liquidity": 0.25,
    "savings": 0.2,
    "debt": 0.25
  },
  "isActive": true
}
```

### 6. **Localization** (localization)
Multilingual content templates

---

## API Endpoints

### 1. Create Configuration

Create a new system configuration.

**Endpoint:** `POST /api/admin/config`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "configKey": "max_recommendations_per_user",
  "configType": "threshold",
  "description": "Maximum active recommendations per user",
  "value": 5,
  "thresholds": {
    "min": 1,
    "max": 10,
    "warning": 7
  },
  "isActive": true
}
```

**Response (201):**
```json
{
  "message": "Configuration created successfully",
  "config": {
    "_id": "507f1f77bcf86cd799439011",
    "configKey": "max_recommendations_per_user",
    "configType": "threshold",
    "value": 5,
    "version": "1.0",
    "isActive": true,
    "createdBy": "admin123",
    "createdAt": "2026-01-21T10:30:00.000Z"
  }
}
```

---

### 2. Get Configuration

Retrieve a specific configuration by key.

**Endpoint:** `GET /api/admin/config/:configKey`

**Example:** `GET /api/admin/config/budget_recommendation_enabled`

**Response (200):**
```json
{
  "config": {
    "_id": "507f1f77bcf86cd799439011",
    "configKey": "budget_recommendation_enabled",
    "configType": "recommendation",
    "value": true,
    "priority": 1,
    "localization": { ... },
    "customerSegments": ["premium", "standard", "basic"],
    "isActive": true,
    "version": "1.0"
  }
}
```

**Response (404):**
```json
{
  "error": "Configuration not found"
}
```

---

### 3. Update Configuration

Update an existing configuration.

**Endpoint:** `PUT /api/admin/config/:configKey`

**Request Body (partial update):**
```json
{
  "value": 10,
  "thresholds": {
    "min": 1,
    "max": 15,
    "warning": 12
  }
}
```

**Response (200):**
```json
{
  "message": "Configuration updated successfully",
  "config": {
    "configKey": "max_recommendations_per_user",
    "value": 10,
    "version": "1.1",
    "modifiedBy": "admin123",
    "updatedAt": "2026-01-21T11:30:00.000Z"
  }
}
```

---

### 4. Get Configurations by Type

Retrieve all configurations of a specific type.

**Endpoint:** `GET /api/admin/config/type/:configType`

**Query Parameters:**
- `activeOnly` (boolean, default: true) - Filter active configs only

**Example:** `GET /api/admin/config/type/recommendation?activeOnly=true`

**Response (200):**
```json
{
  "configs": [
    {
      "configKey": "budget_recommendation_enabled",
      "configType": "recommendation",
      "recommendationType": "BUDGET",
      "value": true,
      "priority": 1,
      "isActive": true
    },
    {
      "configKey": "savings_goal_recommendation_enabled",
      "configType": "recommendation",
      "recommendationType": "SAVINGS_GOAL",
      "value": true,
      "priority": 2,
      "isActive": true
    }
  ]
}
```

---

### 5. Get Recommendation Configurations

Get recommendation configurations with filters.

**Endpoint:** `GET /api/admin/config/recommendations/list`

**Query Parameters:**
- `recommendationType` (optional) - BUDGET, SAVINGS_GOAL, DEBT_OPTIMIZATION, etc.
- `customerSegment` (optional) - Filter by segment (premium, standard, basic)

**Example:** `GET /api/admin/config/recommendations/list?recommendationType=BUDGET&customerSegment=premium`

**Response (200):**
```json
{
  "configs": [
    {
      "configKey": "budget_recommendation_enabled",
      "recommendationType": "BUDGET",
      "priority": 1,
      "localization": {
        "en": {
          "title": "Budget Optimization",
          "description": "Personalized budget recommendations"
        }
      },
      "customerSegments": ["premium", "standard", "basic"],
      "isActive": true
    }
  ]
}
```

---

### 6. Toggle Configuration Status

Enable or disable a configuration.

**Endpoint:** `PATCH /api/admin/config/:configKey/toggle`

**Request Body:**
```json
{
  "isActive": false
}
```

**Response (200):**
```json
{
  "message": "Configuration disabled successfully",
  "config": {
    "configKey": "budget_recommendation_enabled",
    "isActive": false
  }
}
```

---

### 7. Get Configuration History

Retrieve version history for a configuration.

**Endpoint:** `GET /api/admin/config/:configKey/history`

**Response (200):**
```json
{
  "history": [
    {
      "version": "1.0",
      "value": 5,
      "modifiedAt": "2026-01-15T10:00:00.000Z",
      "modifiedBy": "admin"
    },
    {
      "version": "1.1",
      "value": 10,
      "modifiedAt": "2026-01-20T15:30:00.000Z",
      "modifiedBy": "admin"
    }
  ]
}
```

---

### 8. Search Configurations

Search configurations by keyword.

**Endpoint:** `GET /api/admin/config/search/query`

**Query Parameters:**
- `q` (required) - Search term (searches in configKey and description)
- `configType` (optional) - Filter by type
- `isActive` (optional) - true/false
- `tags` (optional) - Comma-separated tags

**Example:** `GET /api/admin/config/search/query?q=recommendation&isActive=true&configType=recommendation`

**Response (200):**
```json
{
  "configs": [
    {
      "configKey": "budget_recommendation_enabled",
      "description": "Enable/disable budget recommendations",
      "configType": "recommendation",
      "isActive": true
    }
  ]
}
```

---

### 9. Get Customer Segments

Retrieve all defined customer segments.

**Endpoint:** `GET /api/admin/config/segments/list`

**Response (200):**
```json
{
  "segments": ["premium", "standard", "basic"]
}
```

---

### 10. Get Statistics

Get configuration statistics for admin dashboard.

**Endpoint:** `GET /api/admin/config/statistics/overview`

**Response (200):**
```json
{
  "statistics": {
    "total": 15,
    "active": 12,
    "inactive": 3,
    "byType": {
      "recommendation": 5,
      "threshold": 6,
      "feature_flag": 2,
      "localization": 2
    }
  }
}
```

---

### 11. Delete Configuration

Soft delete a configuration (sets isActive to false).

**Endpoint:** `DELETE /api/admin/config/:configKey`

**Response (200):**
```json
{
  "message": "Configuration deleted successfully"
}
```

**Response (404):**
```json
{
  "error": "Configuration not found"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Failed to create configuration",
  "details": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access Denied. No token provided."
}
```

### 404 Not Found
```json
{
  "error": "Configuration not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create configuration",
  "details": "Database error message"
}
```

---

## Usage Examples

### Example 1: Create a Budget Recommendation Configuration

```bash
curl -X POST http://localhost:3000/api/admin/config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "budget_max_percentage",
    "configType": "threshold",
    "description": "Maximum budget percentage threshold",
    "value": 80,
    "thresholds": {
      "min": 50,
      "max": 100,
      "warning": 75
    },
    "isActive": true
  }'
```

### Example 2: Get All Recommendation Configurations for Premium Customers

```bash
curl -X GET "http://localhost:3000/api/admin/config/recommendations/list?customerSegment=premium" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 3: Search for Configurations

```bash
curl -X GET "http://localhost:3000/api/admin/config/search/query?q=recommendation&isActive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 4: Update a Configuration

```bash
curl -X PUT http://localhost:3000/api/admin/config/max_recommendations_per_user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 8,
    "thresholds": {
      "min": 1,
      "max": 20,
      "warning": 15
    }
  }'
```

---

## Service Integration

### Using ConfigService in Your Code

```typescript
import adminConfigService from "../services/admin-config.service";

// Get a configuration value
const maxRecommendations = await adminConfigService.getConfigValue<number>(
  "max_recommendations_per_user",
  5 // default value
);

// Get a configuration object
const config = await adminConfigService.getConfig("budget_recommendation_enabled");

// Get a threshold value
const warningThreshold = await adminConfigService.getThreshold(
  "anomaly_detection_threshold",
  "warning"
);

// Get localized text
const localizedText = await adminConfigService.getLocalizedText(
  "budget_recommendation_enabled",
  "en" // language code
);

// Get recommendation configs for a customer segment
const configs = await adminConfigService.getRecommendationConfigs(
  "BUDGET", // recommendation type
  "premium" // customer segment
);
```

---

## Audit Logging

All operations are automatically logged:

**Logged Actions:**
- `CONFIG_CREATED` - When a new configuration is created
- `CONFIG_UPDATED` - When a configuration is updated
- `CONFIG_ENABLED` - When a configuration is enabled
- `CONFIG_DISABLED` - When a configuration is disabled

**Audit Log Fields:**
- User ID
- Action type
- Resource ID
- Severity level
- Change tracking (before/after values)
- Timestamp
- Request metadata (IP, user agent)

---

## Best Practices

1. **Use Meaningful Keys**: Use descriptive, snake_case keys for configurations
2. **Version Management**: System automatically maintains version history
3. **Localization**: Always provide English (en) and consider other languages (si, ta)
4. **Customer Segments**: Use consistent segment names across all configurations
5. **Documentation**: Always include a clear description for each configuration
6. **Testing**: Test threshold values thoroughly before enabling in production
7. **Audit**: Review audit logs regularly for compliance and security

---

## Troubleshooting

### Issue: "Configuration not found"
- Verify the `configKey` is spelled correctly
- Check that the configuration is active (`isActive: true`)
- Use the search or list endpoints to find the correct key

### Issue: Route not found (404)
- Ensure specific routes (like `/search/query`) are accessed before generic routes
- Verify the base path is `/api/admin/config`

### Issue: Authentication errors
- Verify JWT token is valid and not expired
- Include the token in the Authorization header: `Bearer <token>`

### Issue: Database connection errors
- Verify MongoDB is running
- Check `MONGO_URI` environment variable
- Ensure database credentials are correct

---

## Related Documentation

- [Phase 1 API Documentation](./PHASE1_API_DOCS.md)
- [Phase 1 Implementation](./PHASE1_IMPLEMENTATION.md)
- [Consent Management API](./PHASE1_API_DOCS.md#consent-management-apis)
- [Schema Reference](../schemas/admin_config.schema.ts)

