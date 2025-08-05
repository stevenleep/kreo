# GitHub Actions 配置说明

本项目已配置完整的 GitHub Actions CI/CD 流程，包含代码质量检查、安全性检查和自动构建。

## 📋 工作流概览

### 1. 主要 CI/CD 流程 (`.github/workflows/ci.yml`)

**触发条件:**

- 推送到 `main` 或 `develop` 分支
- 向 `main` 分支创建 Pull Request

**包含作业:**

- **代码质量检查** (`lint-and-format`)
    - ESLint 代码规范检查
    - Prettier 代码格式检查
    - TypeScript 类型检查

- **安全审计** (`security-checks`)
    - NPM 依赖项安全审计
    - CodeQL 静态代码分析

- **构建测试** (`build`)
    - 扩展程序完整构建
    - 构建产物上传
    - 构建大小分析

- **部署** (`deploy-dev`, `deploy-prod`)
    - 开发环境部署 (develop 分支)
    - 生产环境部署 (main 分支)

### 2. 安全检查流程 (`.github/workflows/security.yml`)

**触发条件:**

- 推送到 `main` 分支
- 向 `main` 分支创建 Pull Request
- 每周一凌晨 2 点定时执行

**安全检查项目:**

- NPM 安全审计
- 敏感文件扫描
- 硬编码密钥检测
- License 合规性检查
- 恶意包检测
- 安全基线检查

### 3. 代码质量门禁 (`.github/workflows/quality-gate.yml`)

**质量指标:**

- 代码复杂度分析
- 代码重复检测
- 文件大小检查
- 依赖项分析
- 构建状态验证

### 4. 发布流程 (`.github/workflows/release.yml`)

**触发条件:**

- 推送 Git tag (如 `v1.0.0`)

**发布步骤:**

- 代码质量验证
- 扩展程序构建
- GitHub Release 创建
- 扩展包打包上传

## 🔧 本地开发命令

```bash
# 代码质量检查
npm run lint              # 运行 ESLint
npm run lint:fix          # 自动修复 ESLint 问题
npm run type-check        # TypeScript 类型检查
npm run prettier          # 格式化代码
npm run quality:check     # 完整质量检查

# 安全检查
npm run security:audit    # 安全审计
npm run security:fix      # 修复安全问题

# 构建
npm run build             # 基础构建
npm run build:extension   # 完整扩展构建

# 本地验证
./scripts/verify-actions.sh  # 模拟 GitHub Actions 检查
```

## 📁 重要文件

```
.github/
├── workflows/
│   ├── ci.yml              # 主要 CI/CD 流程
│   ├── security.yml        # 安全检查
│   ├── quality-gate.yml    # 质量门禁
│   └── release.yml         # 发布流程
├── dependabot.yml          # 依赖项自动更新
├── ISSUE_TEMPLATE/         # Issue 模板
│   ├── bug_report.yml
│   └── feature_request.yml
└── pull_request_template.md # PR 模板

audit-ci.json               # 安全审计配置
.nvmrc                      # Node.js 版本锁定
CONTRIBUTING.md             # 贡献指南
```

## 🚀 使用流程

### 开发流程

1. 创建功能分支
2. 开发并提交代码
3. 运行本地质量检查: `npm run quality:check`
4. 创建 Pull Request
5. 等待 CI 检查通过
6. 合并到 main 分支

### 发布流程

1. 确保 main 分支代码稳定
2. 创建版本 tag: `git tag v1.0.0`
3. 推送 tag: `git push origin v1.0.0`
4. GitHub Actions 自动构建和发布

## 🔒 安全配置

### 必需的 GitHub Secrets

当前配置使用默认的 `GITHUB_TOKEN`，如需要额外功能可配置：

- `SNYK_TOKEN` - Snyk 安全扫描 (可选)
- `SEMGREP_APP_TOKEN` - Semgrep 分析 (可选)

### 权限要求

- `contents: write` - 创建 Release
- `security-events: write` - 上传安全扫描结果
- `actions: read` - 读取 Actions 状态

## 📊 质量指标

### 代码质量要求

- ✅ ESLint 检查通过
- ✅ TypeScript 编译无错误
- ✅ Prettier 格式规范
- ✅ 无高危安全漏洞
- ✅ 构建成功

### 自动化检查

- 🔄 依赖项每周自动更新 (Dependabot)
- 🔄 安全扫描每周执行
- 🔄 每次 PR 都会触发完整检查

## 💡 最佳实践

1. **提交前检查**: 始终运行 `npm run quality:check`
2. **遵循规范**: 使用项目的 ESLint 和 Prettier 配置
3. **安全意识**: 不要提交敏感信息
4. **版本管理**: 使用语义化版本号
5. **文档更新**: 重大变更时更新 README 和文档

## 🐛 故障排除

### 常见问题

1. **ESLint 错误**: 运行 `npm run lint:fix` 自动修复
2. **格式问题**: 运行 `npm run prettier` 格式化代码
3. **类型错误**: 检查 TypeScript 配置和类型定义
4. **构建失败**: 检查依赖项和构建脚本
5. **安全审计**: 运行 `npm audit fix` 修复已知漏洞

### 获取帮助

- 查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 贡献指南
- 创建 Issue 报告问题
- 参考 GitHub Actions 运行日志
