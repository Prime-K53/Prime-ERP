# Development Workflow & Git Strategy

**Guide**: How to develop and deploy the remaining 5% features

---

## GitHub Workflow

### Branch Naming Convention
```
feature/audit-logs-ui
feature/account-details-dashboard
feature/2fa-implementation
feature/internal-transfers

bugfix/2fa-token-validation
docs/audit-logs-implementation
```

### Branch Structure
```
main (production-ready)
├── stage (pre-production testing)
└── develop (active development)
    ├── feature/audit-logs-ui
    ├── feature/account-details-dashboard
    ├── feature/2fa-implementation
    └── feature/internal-transfers
```

---

## Development Workflow

### 1. Create Feature Branch
```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/audit-logs-ui

# Push to remote
git push -u origin feature/audit-logs-ui
```

### 2. Implement Feature
```bash
# Create components
touch frontend/components/AuditTimeline.tsx
touch frontend/services/auditLogService.ts

# Create backend endpoint
# Edit backend/routes/examination.cjs

# Run development server
npm run dev

# Watch for errors
npm run lint
npm run type-check
```

### 3. Write Tests
```bash
# Create test file
touch frontend/components/__tests__/AuditTimeline.test.tsx

# Run tests
npm test

# Check coverage
npm run test:coverage
```

### 4. Commit Regularly
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: implement audit timeline component

- Displays chronological list of changes
- Shows user, action, before/after values
- Handles large datasets efficiently
- Includes unit tests"

# Push to remote
git push origin feature/audit-logs-ui
```

### 5. Create Pull Request
- Go to GitHub
- Create PR from `feature/audit-logs-ui` → `develop`
- Fill in description
- Request review

### 6. Code Review
- Reviewer checks:
  - ✅ Code follows style guide
  - ✅ All tests pass
  - ✅ No console errors
  - ✅ Performance acceptable
  - ✅ Security implications checked
  - ✅ Backwards compatible

### 7. Merge to Develop
```bash
git checkout develop
git merge feature/audit-logs-ui
git push origin develop
```

### 8. Deploy to Staging
```bash
# Tag release
git tag -a v1.0.1-staging -m "Audit logs feature"

# Deploy to staging environment
npm run deploy:staging

# Run staging tests
npm run test:e2e --env=staging

# Verify in staging
# ... manual testing ...
```

### 9. Merge to Main (Production)
```bash
# Create PR from develop → main
# After approval:
git checkout main
git merge develop
git push origin main

# Tag production release
git tag -a v1.0.1 -m "Release: Audit logs and account details"

# Deploy to production
npm run deploy:production
```

---

## Parallel Development Strategy

### Team Assignment (Multiple Developers)

**Developer 1**: Audit Logs + Account Details (Phase 1)
```bash
git checkout -b feature/audit-logs-ui
git checkout -b feature/account-details-dashboard
```

**Developer 2**: 2FA Implementation (Phase 2)
```bash
git checkout -b feature/2fa-implementation
```

**Developer 3**: Internal Transfers (Phase 3)
```bash
git checkout -b feature/internal-transfers
```

All work independently and merge to `develop` when ready.

---

## Testing Strategy

### Unit Tests (Component Level)
```bash
# Run specific test
npm test -- AuditTimeline.test.tsx

# Run all tests
npm test

# Watch mode
npm test -- --watch
```

### Integration Tests (API + UI)
```bash
npm run test:integration

# Test specific feature
npm run test:integration -- audit-logs
```

### E2E Tests (Full User Flow)
```bash
npm run test:e2e

# Test specific flow
npm run test:e2e -- specs/audit-logs.spec.ts
```

### Coverage Report
```bash
npm run test:coverage

# Check specific file
npm run test:coverage -- AuditTimeline
```

### Performance Tests
```bash
npm run test:performance

# Measure load times
npm run test:perf -- --baseline
```

---

## Code Quality Gates

### Before Committing
```bash
# Run linter
npm run lint

# Fix linter issues
npm run lint -- --fix

# Type check
npm run type-check

# Run tests
npm test

# Check test coverage (minimum 80%)
npm run test:coverage
```

### Automated Checks (CI/CD)
GitHub Actions runs automatically on PR:
- ✅ ESLint
- ✅ TypeScript type checking
- ✅ Unit tests
- ✅ Integration tests
- ✅ Build verification
- ✅ Security scan

If any fail, PR cannot be merged.

---

## Release Management

### Version Numbers
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features
- **Patch** (1.0.1): Bug fixes

### Current Release: v1.0.0 (95% Complete)

```
v1.0.0                  (baseline - 95% complete)
  ├── v1.0.1            (audit logs + account details)
  ├── v1.0.2            (2FA complete)
  ├── v1.0.3            (internal transfers - optional)
  └── v1.1.0            (next major release)
```

### Release Checklist
```
Week 1 Release (v1.0.1):
- [ ] Audit logs tested
- [ ] Account details tested
- [ ] No regressions
- [ ] Performance acceptable
- [ ] Deployed to staging (2 days before)
- [ ] Approved for production
- [ ] Deployed to production
- [ ] Monitoring alerts active
- [ ] Release notes published

Week 2 Release (v1.0.2):
- [ ] 2FA tested thoroughly
- [ ] Security audit passed
- [ ] All backup codes tested
- [ ] Device trust working
- [ ] Deployed to staging
- [ ] Approved for production
- [ ] Deployed to production

Optional Week 3 Release (v1.0.3):
- [ ] Internal transfers tested
- [ ] Workflow states verified
- [ ] Stock counts correct
- [ ] Deployed and verified
```

---

## Deployment Environments

### Development (Local)
```bash
npm run dev
# Localhost:3000 (frontend)
# Localhost:3001 (backend)
```

### Staging
```bash
npm run deploy:staging
# Tests everything before production
# https://staging-erp.example.com
```

### Production
```bash
npm run deploy:production
# Final production deployment
# https://erp.example.com
```

---

## Rollback Procedure

If something breaks in production:

### Quick Rollback
```bash
# Identify last good commit
git log --oneline | head -20

# Revert
git revert <bad-commit-hash>
git push origin main

# Re-deploy
npm run deploy:production
```

### Database Rollback (if needed)
```bash
# Restore backup
npm run restore:backup -- --date=2026-04-11

# Verify data integrity
npm run verify:database
```

### Zero-Downtime Rollback
1. Keep both versions running
2. Switch traffic to previous version
3. Stop problematic version
4. Keep on previous version until fixed

---

## Monitoring & Logging

### Post-Deployment Checks
```bash
# Check error rates
npm run monitoring:errors

# Monitor performance
npm run monitoring:performance

# Check user reports
npm run monitoring:support-tickets
```

### Alert Thresholds
- Error rate > 1% → Alert
- Page load time > 3s → Alert
- API response > 2s → Alert
- Database errors > 5/min → Alert

### Logs to Monitor
```
frontend/errors.log       # Client errors
backend/errors.log        # Server errors
database/errors.log       # Database errors
api/performance.log       # API response times
auth/audit.log            # Authorization events
```

---

## Feature Flags

### Enable/Disable Features Remotely

```javascript
// In code
if (featureFlags.auditLogsEnabled) {
  return <AuditTimeline />;
}

// Toggle in Settings
Settings → Feature Flags → Toggle "Audit Logs UI"
```

### Deployment with Flags
1. Deploy code with feature **disabled**
2. Test in production (flag off)
3. Enable flag for 10% users
4. Monitor for errors
5. Increase to 50% users
6. Increase to 100% users
7. Remove feature flag (finalize)

---

## Communication

### Daily Standup (15 min)
- What I completed yesterday
- What I'm working on today
- Blockers/dependencies

### Weekly Review (Friday)
- Demo completed features
- Review pull requests
- Plan next week

### Release Notes
Before each production deployment, publish:
```markdown
# Release v1.0.1 - Audit Logs & Account Details

## New Features
- ✅ Full audit log history visible in all modules
- ✅ Customer account analysis dashboard
- ✅ Aging analysis and payment pattern tracking

## Bug Fixes
- Fixed audit log display lag
- Corrected aging bucket calculations

## Performance
- Audit log queries optimized (index added)
- Account details load in < 2s

## Breaking Changes
None

## Migration Steps
None required

## Deployment Time
5 minutes

## Support
Contact: support@example.com
```

---

## Troubleshooting

### Build Fails Locally
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force

# Try again
npm run build
```

### Tests Fail
```bash
# Update snapshots
npm test -- -u

# Run specific test
npm test -- AuditTimeline

# Debug test
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Staging Deployment Fails
```bash
# Check logs
kubectl logs -f deployment/erp-backend

# Check database connection
npm run test:db

# Rollback
git revert <deploy-commit>
npm run deploy:staging
```

---

## Success Metrics

Track these after each deployment:

| Metric | Target | Current |
|--------|--------|---------|
| **Error Rate** | < 0.5% | ? |
| **Page Load** | < 2s | ? |
| **API Response** | < 500ms | ? |
| **Uptime** | 99.9% | ? |
| **User Satisfaction** | > 4.5/5 | ? |

---

## Example: Audit Logs Workflow

### Day 1: Setup
```bash
git checkout -b feature/audit-logs-ui
# Update develop branch first
```

### Day 1-2: Implementation
```bash
touch frontend/components/AuditTimeline.tsx
touch frontend/services/auditLogService.ts
# Write code
npm run lint -- --fix
npm test
# Commit regularly
```

### Day 3: Testing
```bash
npm run test:coverage
npm run test:e2e -- audit-logs
# Create GitHub PR
```

### Day 4: Review
```bash
# Request review
# Address feedback
# Merge to develop
```

### Day 5: Deploy
```bash
git checkout deploy
git merge feature/audit-logs-ui
npm run deploy:staging
# Test in staging

# After approval
git checkout main
git merge feature/audit-logs-ui
npm run deploy:production
```

### Day 5-6: Monitor
```bash
npm run monitoring:errors
npm run monitoring:performance
# No issues? Success! 🎉
```

---

## Key Files to Know

```
.github/workflows/         # CI/CD pipelines
├── lint.yml            # Linting checks
├── tests.yml           # Test execution
├── build.yml           # Build verification
└── deploy.yml          # Deployment automation

package.json             # Scripts and dependencies
jest.config.js          # Test configuration
tsconfig.json           # TypeScript configuration
.eslintrc.js            # Linting rules
.gitignore              # Ignored files
```

---

## Resources

- **Git Guide**: https://git-scm.com/book
- **Testing Best Practices**: https://testing-library.com
- **CI/CD**: https://docs.github.com/en/actions
- **Security**: https://owasp.org/
- **Performance**: https://web.dev/performance

---

**Ready to start developing? Follow this workflow and you'll ship reliably and safely! 🚀**
