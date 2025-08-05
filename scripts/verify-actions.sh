#!/bin/bash

# GitHub Actions本地验证脚本
echo "🚀 开始GitHub Actions工作流本地验证..."

# 代码质量检查
echo "📋 检查代码质量..."
npm run lint || echo "⚠️ ESLint检查发现问题"
npm run type-check || echo "⚠️ TypeScript类型检查发现问题"
npx prettier --check . || echo "⚠️ Prettier格式检查发现问题"

# 安全检查
echo "🔒 检查安全性..."
npm audit --audit-level=moderate || echo "⚠️ NPM安全审计发现问题"

# 构建测试
echo "🏗️ 测试构建..."
npm run build:extension || echo "❌ 构建失败"

# 检查构建产物
if [ -d "dist" ]; then
    echo "✅ 构建成功，检查构建产物大小:"
    du -sh dist/
    echo "📦 构建文件列表:"
    find dist/ -type f -name "*" -exec ls -lh {} \;
else
    echo "❌ 构建目录不存在"
    exit 1
fi

echo "🎉 GitHub Actions工作流本地验证完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 提交代码到main分支将触发完整的CI/CD流程"
echo "2. 创建Pull Request将触发代码质量检查"
echo "3. 推送tag (如v1.0.0)将触发发布流程"
echo ""
echo "🔧 工作流文件位置:"
echo "- .github/workflows/ci.yml - 主要CI/CD流程"
echo "- .github/workflows/security.yml - 安全检查"
echo "- .github/workflows/quality-gate.yml - 代码质量门禁"
echo "- .github/workflows/release.yml - 发布流程"
