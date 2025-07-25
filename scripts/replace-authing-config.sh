#!/bin/bash
# 全局替换 Authing 配置脚本
# 用于将旧的 AppID、认证域名、回调URL 批量替换为新配置
# 使用方法：bash scripts/replace-authing-config.sh

set -e

# 旧配置
OLD_APPID1="687cc2a82e907f6e8aea5848"
OLD_APPID2="6867fdc88034eb95ae86167d"
OLD_APPID3="687e0aafee2b84f86685b644"
OLD_HOST1="aiwenpai.authing.cn"
OLD_HOST2="wenpaiai.authing.cn"
OLD_HOST3="qutkgzkfaezk-demo.authing.cn"
OLD_HOST4="ai-wenpai.authing.cn"

# 新配置 - 基于Authing控制台最新配置
NEW_APPID="688237f7f9e118de849dc274"
NEW_DOMAIN="rzcswqd4sq0f.authing.cn"
NEW_HOST="https://rzcswqd4sq0f.authing.cn"

# 回调URL
OLD_CALLBACK1="http://localhost:5173/callback"
OLD_CALLBACK2="https://wenpai.netlify.app/callback"
OLD_CALLBACK3="https://www.wenpai.xyz/callback"
NEW_CALLBACK1="http://localhost:5173/callback"
NEW_CALLBACK2="https://wenpai.netlify.app/callback"
NEW_CALLBACK3="https://www.wenpai.xyz/callback"

# 替换 AppID
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' -o -name '*.md' -o -name '*.toml' \) -exec sed -i '' "s/$OLD_APPID1/$NEW_APPID/g" {} +
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' -o -name '*.md' -o -name '*.toml' \) -exec sed -i '' "s/$OLD_APPID2/$NEW_APPID/g" {} +
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' -o -name '*.md' -o -name '*.toml' \) -exec sed -i '' "s/$OLD_APPID3/$NEW_APPID/g" {} +

# 替换认证域名
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' -o -name '*.md' -o -name '*.toml' \) -exec sed -i '' "s@$OLD_HOST1@$NEW_DOMAIN@g" {} +
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' -o -name '*.md' -o -name '*.toml' \) -exec sed -i '' "s@$OLD_HOST2@$NEW_DOMAIN@g" {} +
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' -o -name '*.md' -o -name '*.toml' \) -exec sed -i '' "s@$OLD_HOST3@$NEW_DOMAIN@g" {} +
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' -o -name '*.md' -o -name '*.toml' \) -exec sed -i '' "s@$OLD_HOST4@$NEW_DOMAIN@g" {} +

# 替换回调URL（确保所有三项都存在）
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' \) -exec sed -i '' "s@$OLD_CALLBACK1@$NEW_CALLBACK1@g" {} +
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' \) -exec sed -i '' "s@$OLD_CALLBACK2@$NEW_CALLBACK2@g" {} +
find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.cjs' -o -name '*.json' -o -name '*.env*' \) -exec sed -i '' "s@$OLD_CALLBACK3@$NEW_CALLBACK3@g" {} +

# 替换 host 字段中的 https:// 前缀
find . -type f \( -name '*.env*' -o -name '*.ts' -o -name '*.js' -o -name '*.cjs' \) -exec sed -i '' "s@https://$NEW_HOST@$NEW_HOST@g" {} +

# 输出完成提示
echo "✅ Authing 配置全局替换完成！请检查 git diff 并重启服务。" 