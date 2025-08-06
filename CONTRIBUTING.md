# Contributing Guide

Thank you for your interest in the Kreo project! We welcome all forms of contributions.

## 🚀 Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/stevenleep/kreo.git
cd kreo

# Install dependencies
npm install

# Start development server
npm run dev

# Build extension
npm run build:extension
```

## 📋 Development Workflow

1. **Fork** this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

## ✅ Code Quality Requirements

Before submitting code, please ensure:

### Code Style Checks

```bash
# Run code linting
npm run lint

# Auto-fix fixable issues
npm run lint:fix

# Check code formatting
npm run prettier --check

# Auto-format code
npm run prettier
```

### Type Checking

```bash
# TypeScript type checking
npm run type-check
```

### Security Checks

```bash
# Dependency security audit
npm run security:audit

# Auto-fix security issues
npm run security:fix
```

### Complete Quality Check

```bash
# Run all quality checks
npm run quality:check
```

## 🔒 Security Requirements

- All dependencies must pass security audit
- No sensitive information allowed (API keys, passwords, etc.)
- Follow the principle of least privilege

## 🧪 Testing

The project is currently building a testing framework. Future requirements will include:

- New features must include corresponding tests
- Ensure test coverage meets requirements
- All tests must pass

## 📝 Commit Message Convention

Use conventional commit message format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types include:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (changes that do not affect code execution)
- `refactor`: Refactoring
- `perf`: Performance optimization
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

Examples:

```bash
git commit -m "feat(drawing): add circle drawing tool"
git commit -m "fix(canvas): resolve canvas scaling issue"
git commit -m "docs: update installation instructions"
```

## 🎯 Pull Request Guidelines

### PR Title

Use clear, descriptive titles, for example:

- `feat: add circle drawing tool`
- `fix: resolve canvas scaling issue`
- `docs: update installation instructions`

### PR Description

Please include:

- Brief description of changes
- Link to related issues (if any)
- Testing steps
- Screenshots or GIFs (for UI changes)

### Checklist

Before submitting a PR, please confirm:

- [ ] Code passes all quality checks
- [ ] Updated relevant documentation
- [ ] Tested all changes
- [ ] Commit messages follow convention
- [ ] PR description is clear and complete

## 🤝 Getting Help

If you have any questions, you can:

- Create an Issue
- Participate in Discussions
- Check existing documentation and code comments

Thank you again for your contribution! 🎉
