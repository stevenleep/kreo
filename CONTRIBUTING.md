# 贡献指南

感谢您对 Kreo 项目的关注！我们欢迎所有形式的贡献。

## 🚀 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/stevenleep/kreo.git
cd kreo

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建扩展
npm run build:extension
```

## 📋 开发流程

1. **Fork** 本仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 **Pull Request**

## ✅ 代码质量要求

在提交代码之前，请确保：

### 代码规范检查
```bash
# 运行代码检查
npm run lint

# 自动修复可修复的问题
npm run lint:fix

# 检查代码格式
npm run prettier --check

# 自动格式化代码
npm run prettier
```

### 类型检查
```bash
# TypeScript类型检查
npm run type-check
```

### 安全检查
```bash
# 依赖项安全审计
npm run security:audit

# 自动修复安全问题
npm run security:fix
```

### 完整质量检查
```bash
# 运行所有质量检查
npm run quality:check
```

## 🔒 安全要求

- 所有依赖项都必须通过安全审计
- 不允许包含敏感信息（API密钥、密码等）
- 遵循最小权限原则

## 🧪 测试

当前项目正在建设测试框架，未来将要求：
- 新功能必须包含相应的测试
- 确保测试覆盖率达到要求
- 所有测试必须通过

## 📝 提交信息规范

使用约定式提交信息格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

类型包括：
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更改
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat(drawing): add circle drawing tool"
git commit -m "fix(canvas): resolve canvas scaling issue"
git commit -m "docs: update installation instructions"
```

## 🎯 Pull Request 指南

### PR标题
使用清晰、描述性的标题，例如：
- `feat: 添加圆形绘制工具`
- `fix: 修复画布缩放问题`
- `docs: 更新安装说明`

### PR描述
请包含：
- 变更内容的简要描述
- 相关issue的链接（如果有）
- 测试步骤
- 截图或GIF（对于UI变更）

### 检查清单
在提交PR之前，请确认：
- [ ] 代码通过所有质量检查
- [ ] 已更新相关文档
- [ ] 已测试所有变更
- [ ] 提交信息符合规范
- [ ] PR描述清晰完整

## 🤝 获取帮助

如果您有任何问题，可以：
- 创建一个 Issue
- 参与 Discussions
- 查看现有的文档和代码注释

再次感谢您的贡献！🎉
