# Contributing to FlickFuse

Thank you for your interest in contributing to FlickFuse! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. We are committed to making participation in this project a harassment-free experience for everyone.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- Git installed
- Node.js 20+ installed
- Python 3.11+ installed
- Docker and Docker Compose (optional)

### Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/streamsync.git
cd streamsync
```

3. Set up the development environment:

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env  # Configure your credentials
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your credentials
uvicorn app.main:app --reload
```

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check the [issues](https://github.com/yourusername/streamsync/issues) to see if it's already reported
2. Create a detailed bug report including:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details

### Suggesting Features

We welcome feature suggestions! When suggesting a feature:

1. Check existing issues and PRs
2. Describe the problem you're solving
3. Explain your proposed solution
4. Consider backward compatibility

### Pull Requests

#### PR Process

1. **Fork** the repository
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Ensure tests pass**:
   ```bash
   # Frontend
   cd frontend
   npm run lint
   npm run test:run
   
   # Backend
   cd backend
   python -m pytest tests/ -v
   ```
6. **Commit your changes** with clear messages:
   ```
   feat: add new recommendation algorithm
   fix: resolve list sorting issue
   docs: update API documentation
   refactor: simplify authentication flow
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request**

#### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

## Coding Standards

### Frontend (TypeScript/React)

- Use functional components with hooks
- Prefer `const` over `let`
- Always define proper TypeScript types (avoid `any`)
- Follow existing naming conventions
- Write self-documenting code with clear variable names

### Backend (Python)

- Follow PEP 8 style guide
- Use type hints for function signatures
- Use async/await for I/O operations
- Handle exceptions appropriately
- Write docstrings for public functions

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(friends): add friend request notifications
fix(lists): resolve duplicate item bug
docs(api): update endpoint documentation
```

## Branching Strategy

- `main`: Stable, production-ready code
- `develop`: Integration branch for features
- `feature/*`: New feature branches
- `fix/*`: Bug fix branches
- `hotfix/*`: Urgent production fixes

## Development Workflow

1. Pull latest changes from `main`
2. Create a feature branch
3. Make small, focused commits
4. Keep your branch updated with `main`
5. Test thoroughly before submitting PR
6. Request review from maintainers

## Questions?

Feel free to:
- Open an issue for questions
- Join our community discussions
- Contact maintainers directly

## Recognition

Contributors will be recognized in:
- The project's README contributors section
- Release notes for significant contributions
- Our community channels

Thank you for contributing to FlickFuse!
