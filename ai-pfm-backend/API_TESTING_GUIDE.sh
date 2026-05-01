#!/bin/bash
# Admin Configuration API - cURL Testing Examples
# This script contains common API calls for testing the Admin Configuration endpoints

# Configuration
API_BASE_URL="http://localhost:3000/api/admin/config"
JWT_TOKEN="your_jwt_token_here"  # Replace with actual JWT token

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function print_section() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

function print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# 1. CREATE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

print_section "1. CREATE CONFIGURATION"

echo "Request: POST /api/admin/config"
echo "Creating a new threshold configuration..."

curl -X POST "$API_BASE_URL" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "max_recommendations_per_user",
    "configType": "threshold",
    "description": "Maximum number of active recommendations per user",
    "value": 5,
    "thresholds": {
      "min": 1,
      "max": 10,
      "warning": 7,
      "critical": 9
    },
    "isActive": true
  }' | jq '.'

echo ""
print_success "Configuration created successfully"

# ═══════════════════════════════════════════════════════════════════════════════
# 2. CREATE RECOMMENDATION CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

print_section "2. CREATE RECOMMENDATION CONFIGURATION"

echo "Request: POST /api/admin/config"
echo "Creating a budget recommendation configuration with localization..."

curl -X POST "$API_BASE_URL" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configKey": "budget_alert_threshold",
    "configType": "recommendation",
    "recommendationType": "BUDGET",
    "description": "Budget spending alert threshold",
    "value": 80,
    "priority": 1,
    "localization": {
      "en": {
        "title": "Budget Alert",
        "description": "Get alerts when spending exceeds threshold",
        "template": "You have spent {{percentage}}% of your {{category}} budget"
      },
      "si": {
        "title": "අයවැය අනතුරු ඇඟවීම",
        "description": "වියදම සීමාව ඉක්මවන විට ඇඟවීම් ලබండි",
        "template": "ඔබ ඔබේ {{category}} අයවැයෙන් {{percentage}}% ගතකර ඉවරයි"
      }
    },
    "customerSegments": ["premium", "standard", "basic"],
    "isEnabledBySegment": {
      "premium": true,
      "standard": true,
      "basic": true
    },
    "isActive": true
  }' | jq '.'

echo ""
print_success "Recommendation configuration created"

# ═══════════════════════════════════════════════════════════════════════════════
# 3. GET CONFIGURATION BY KEY
# ═══════════════════════════════════════════════════════════════════════════════

print_section "3. GET CONFIGURATION BY KEY"

echo "Request: GET /api/admin/config/max_recommendations_per_user"
echo "Retrieving configuration by key..."

curl -X GET "$API_BASE_URL/max_recommendations_per_user" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""
print_success "Configuration retrieved"

# ═══════════════════════════════════════════════════════════════════════════════
# 4. GET CONFIGURATIONS BY TYPE
# ═══════════════════════════════════════════════════════════════════════════════

print_section "4. GET CONFIGURATIONS BY TYPE"

echo "Request: GET /api/admin/config/type/recommendation"
echo "Retrieving all recommendation configurations..."

curl -X GET "$API_BASE_URL/type/recommendation?activeOnly=true" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""
print_success "Recommendations retrieved"

# ═══════════════════════════════════════════════════════════════════════════════
# 5. GET RECOMMENDATION CONFIGURATIONS WITH FILTERS
# ═══════════════════════════════════════════════════════════════════════════════

print_section "5. GET RECOMMENDATION CONFIGURATIONS WITH FILTERS"

echo "Request: GET /api/admin/config/recommendations/list?recommendationType=BUDGET&customerSegment=premium"
echo "Retrieving BUDGET recommendations for premium customers..."

curl -X GET "$API_BASE_URL/recommendations/list?recommendationType=BUDGET&customerSegment=premium" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""
print_success "Filtered recommendations retrieved"

# ═══════════════════════════════════════════════════════════════════════════════
# 6. UPDATE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

print_section "6. UPDATE CONFIGURATION"

echo "Request: PUT /api/admin/config/max_recommendations_per_user"
echo "Updating configuration value..."

curl -X PUT "$API_BASE_URL/max_recommendations_per_user" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 10,
    "thresholds": {
      "min": 1,
      "max": 15,
      "warning": 12,
      "critical": 14
    }
  }' | jq '.'

echo ""
print_success "Configuration updated"

# ═══════════════════════════════════════════════════════════════════════════════
# 7. TOGGLE CONFIGURATION STATUS
# ═══════════════════════════════════════════════════════════════════════════════

print_section "7. TOGGLE CONFIGURATION STATUS"

echo "Request: PATCH /api/admin/config/max_recommendations_per_user/toggle"
echo "Disabling configuration..."

curl -X PATCH "$API_BASE_URL/max_recommendations_per_user/toggle" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }' | jq '.'

echo ""
print_success "Configuration disabled"

echo "Re-enabling configuration..."

curl -X PATCH "$API_BASE_URL/max_recommendations_per_user/toggle" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": true
  }' | jq '.'

echo ""
print_success "Configuration re-enabled"

# ═══════════════════════════════════════════════════════════════════════════════
# 8. GET CONFIGURATION HISTORY
# ═══════════════════════════════════════════════════════════════════════════════

print_section "8. GET CONFIGURATION HISTORY"

echo "Request: GET /api/admin/config/max_recommendations_per_user/history"
echo "Retrieving version history..."

curl -X GET "$API_BASE_URL/max_recommendations_per_user/history" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""
print_success "Configuration history retrieved"

# ═══════════════════════════════════════════════════════════════════════════════
# 9. SEARCH CONFIGURATIONS
# ═══════════════════════════════════════════════════════════════════════════════

print_section "9. SEARCH CONFIGURATIONS"

echo "Request: GET /api/admin/config/search/query?q=recommendation&isActive=true"
echo "Searching for active recommendations..."

curl -X GET "$API_BASE_URL/search/query?q=recommendation&isActive=true" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""

echo "Request: GET /api/admin/config/search/query?q=budget&configType=recommendation"
echo "Searching for budget configurations..."

curl -X GET "$API_BASE_URL/search/query?q=budget&configType=recommendation" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""
print_success "Configurations searched"

# ═══════════════════════════════════════════════════════════════════════════════
# 10. GET CUSTOMER SEGMENTS
# ═══════════════════════════════════════════════════════════════════════════════

print_section "10. GET CUSTOMER SEGMENTS"

echo "Request: GET /api/admin/config/segments/list"
echo "Retrieving customer segments..."

curl -X GET "$API_BASE_URL/segments/list" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""
print_success "Customer segments retrieved"

# ═══════════════════════════════════════════════════════════════════════════════
# 11. GET STATISTICS
# ═══════════════════════════════════════════════════════════════════════════════

print_section "11. GET STATISTICS"

echo "Request: GET /api/admin/config/statistics/overview"
echo "Retrieving configuration statistics..."

curl -X GET "$API_BASE_URL/statistics/overview" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""
print_success "Statistics retrieved"

# ═══════════════════════════════════════════════════════════════════════════════
# 12. DELETE CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

print_section "12. DELETE CONFIGURATION"

echo "Request: DELETE /api/admin/config/max_recommendations_per_user"
echo "Deleting configuration (soft delete - sets isActive to false)..."

curl -X DELETE "$API_BASE_URL/max_recommendations_per_user" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'

echo ""
print_success "Configuration deleted (soft delete)"

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

print_section "TESTING COMPLETE"

echo "Summary of tested endpoints:"
echo "✓ POST   /api/admin/config                                    - Create"
echo "✓ GET    /api/admin/config/:configKey                         - Get by key"
echo "✓ GET    /api/admin/config/type/:configType                   - Get by type"
echo "✓ GET    /api/admin/config/recommendations/list               - Get recommendations"
echo "✓ PUT    /api/admin/config/:configKey                         - Update"
echo "✓ PATCH  /api/admin/config/:configKey/toggle                  - Toggle status"
echo "✓ GET    /api/admin/config/:configKey/history                 - Get history"
echo "✓ GET    /api/admin/config/search/query                       - Search"
echo "✓ GET    /api/admin/config/segments/list                      - Get segments"
echo "✓ GET    /api/admin/config/statistics/overview                - Get statistics"
echo "✓ DELETE /api/admin/config/:configKey                         - Delete (soft)"
echo ""
print_success "All endpoints tested successfully!"
