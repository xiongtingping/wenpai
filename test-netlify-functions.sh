#!/bin/bash

# Netlify Functions快速测试脚本
# 创建日期: 2025-10-02

echo "🚀 Netlify Functions 订阅权限系统测试"
echo "========================================="
echo ""

# 检测环境
if lsof -i:8888 >/dev/null 2>&1; then
  BASE_URL="http://localhost:8888"
  ENV="本地开发环境 (netlify dev)"
else
  BASE_URL="https://www.wenpai.xyz"
  ENV="生产环境"
fi

echo "测试环境: $ENV"
echo "基础URL: $BASE_URL"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
  local name=$1
  local url=$2
  local method=${3:-GET}
  local data=${4:-}

  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "${BLUE}测试 $TOTAL_TESTS: $name${NC}"

  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    if [ ! -z "$body" ]; then
      echo "响应: $(echo $body | jq -c . 2>/dev/null || echo $body | cut -c1-100)"
    fi
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    if [ ! -z "$body" ]; then
      echo "错误: $body"
    fi
  fi
  echo ""
}

echo "📡 1. 测试Netlify Functions API"
echo "---------------------------------"

# 测试1: 支付回调健康检查
test_api "支付回调健康检查" \
  "$BASE_URL/api/webhooks/payment-callback" \
  "GET"

# 测试2: Trial用户访问Pro功能
test_api "Trial用户访问Pro功能 (应拒绝)" \
  "$BASE_URL/api/permissions/verify" \
  "POST" \
  '{"userId":"00000000-0000-0000-0000-000000000001","permission":"tier:pro"}'

# 测试3: Pro用户访问Pro功能
test_api "Pro用户访问Pro功能 (应允许)" \
  "$BASE_URL/api/permissions/verify" \
  "POST" \
  '{"userId":"00000000-0000-0000-0000-000000000002","permission":"tier:pro"}'

# 测试4: Premium用户访问Premium功能
test_api "Premium用户访问Premium功能 (应允许)" \
  "$BASE_URL/api/permissions/verify" \
  "POST" \
  '{"userId":"00000000-0000-0000-0000-000000000003","permission":"tier:premium"}'

# 测试5: Trial用户访问Trial功能
test_api "Trial用户访问Trial功能 (应允许)" \
  "$BASE_URL/api/permissions/verify" \
  "POST" \
  '{"userId":"00000000-0000-0000-0000-000000000001","permission":"tier:trial"}'

echo ""
echo "========================================="
echo "📊 测试结果汇总"
echo "---------------------------------"
echo "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 所有测试通过！Netlify Functions运行正常${NC}"
  echo ""
  echo "📋 下一步:"
  echo "  1. 查看演示页面: $BASE_URL/permission-demo"
  echo "  2. 配置支付平台回调URL: $BASE_URL/api/webhooks/payment-callback"
  echo "  3. 部署到生产: netlify deploy --prod"
  echo "  4. 查看完整文档: NETLIFY_DEPLOYMENT_GUIDE.md"
  exit 0
else
  echo ""
  echo -e "${YELLOW}⚠️  部分测试失败${NC}"
  echo ""
  echo "🔍 故障排查:"
  if [ "$ENV" = "生产环境" ]; then
    echo "  1. 确认Functions已部署到生产环境"
    echo "  2. 检查Netlify Dashboard → Functions"
    echo "  3. 查看Functions日志"
    echo "  4. 验证环境变量配置"
  else
    echo "  1. 确认 'netlify dev' 正在运行"
    echo "  2. 检查端口8888是否被占用"
    echo "  3. 查看控制台日志"
    echo "  4. 验证.env配置"
  fi
  exit 1
fi
