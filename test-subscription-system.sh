#!/bin/bash

# 订阅权限系统快速验证脚本
# 创建日期: 2025-10-02

echo "🚀 订阅权限系统验证测试"
echo "================================"
echo ""

BASE_URL="http://localhost:5174"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_endpoint() {
  local name=$1
  local url=$2
  local method=${3:-GET}
  local data=${4:-}

  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -n "测试 $TOTAL_TESTS: $name ... "

  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    if [ ! -z "$body" ]; then
      echo "   响应: $(echo $body | cut -c1-100)"
    fi
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    if [ ! -z "$body" ]; then
      echo "   错误: $body"
    fi
  fi
  echo ""
}

echo "📡 1. 测试API端点"
echo "--------------------------------"

# 测试1: 支付回调健康检查
test_endpoint "支付回调健康检查" \
  "$BASE_URL/api/webhooks/payment-callback" \
  "GET"

# 测试2: Trial用户访问Pro功能
test_endpoint "Trial用户访问Pro功能" \
  "$BASE_URL/api/permissions/verify" \
  "POST" \
  '{"userId":"00000000-0000-0000-0000-000000000001","permission":"tier:pro"}'

# 测试3: Pro用户访问Pro功能
test_endpoint "Pro用户访问Pro功能" \
  "$BASE_URL/api/permissions/verify" \
  "POST" \
  '{"userId":"00000000-0000-0000-0000-000000000002","permission":"tier:pro"}'

# 测试4: Premium用户访问Premium功能
test_endpoint "Premium用户访问Premium功能" \
  "$BASE_URL/api/permissions/verify" \
  "POST" \
  '{"userId":"00000000-0000-0000-0000-000000000003","permission":"tier:premium"}'

echo ""
echo "🌐 2. 测试前端页面"
echo "--------------------------------"

# 测试5: 演示页面
test_endpoint "权限演示页面" \
  "$BASE_URL/permission-demo" \
  "GET"

# 测试6: 首页
test_endpoint "应用首页" \
  "$BASE_URL/" \
  "GET"

echo ""
echo "================================"
echo "📊 测试结果汇总"
echo "--------------------------------"
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 所有测试通过！系统运行正常${NC}"
  echo ""
  echo "📋 下一步:"
  echo "  1. 访问演示页面: $BASE_URL/permission-demo"
  echo "  2. 查看完整文档: SUBSCRIPTION_SYSTEM_COMPLETION_SUMMARY.md"
  echo "  3. 配置支付平台回调URL"
  exit 0
else
  echo ""
  echo -e "${YELLOW}⚠️  部分测试失败，请检查配置${NC}"
  echo ""
  echo "🔍 故障排查:"
  echo "  1. 确认开发服务器正在运行: $BASE_URL"
  echo "  2. 检查 .env 配置: SUPABASE_SERVICE_ROLE_KEY"
  echo "  3. 查看数据库连接状态"
  echo "  4. 检查 Supabase 表结构"
  exit 1
fi
