# Implementation Plan - Quick Reference Guide

**Full Plan**: See `IMPLEMENTATION_PLAN_5_PERCENT.md`

---

## TL;DR: What to Build

### Phase 1: WEEK 1 (2-3 days) - Quick Wins ⚡
| Feature | Hours | Priority | Difficulty |
|---------|-------|----------|------------|
| **Audit Logs UI** | 5-7 | 🔴 HIGH | 🟢 EASY |
| **Account Details** | 4-6 | 🔴 HIGH | 🟡 MEDIUM |

**Why First**: Backend ✅ complete, just add UI layer. Takes 2-3 days. Users need this.

---

### Phase 2: WEEK 2 (3-5 days) - Security 🔐
| Feature | Hours | Priority | Difficulty |
|---------|-------|----------|------------|
| **Verify 2FA** | 2-4 | 🟡 URGENT | 🟢 EASY |
| **Complete 2FA** | 12-16 | 🔴 HIGH | 🔴 HARD |

**Why Second**: Verify first (2-4 hrs to check status). Then build if needed. Critical for security.

---

### Phase 3: WEEK 3+ (1-2 weeks) - Nice-to-Have 🎁
| Feature | Hours | Priority | Difficulty |
|---------|-------|----------|------------|
| **Internal Transfers** | 8-10 | 🟢 LOW | 🔴 HARD |

**Why Last**: Optional. Manual process works. Do after Phase 1 & 2 done.

---

## Quick Start: What to Do Tomorrow

### IMMEDIATE (2-4 hours)
1. **Check 2FA status** - This is the blocker
   ```bash
   # Search for 2FA implementation
   grep -r "2fa\|twoFactor\|speakeasy" backend/ frontend/
   ```

2. **Understand audit log schema**
   ```bash
   # Show audit log table
   sqlite3 your-database.db ".schema audit_logs"
   ```

3. **Plan development** - Create branches for each feature

### TODAY (4-6 hours)
1. **Start Audit Logs** - Lowest hanging fruit
   - Create `auditLogService.ts`
   - Create `AuditTimeline.tsx` component
   
2. **Start Account Details** - Can work in parallel
   - Create `accountAnalysisService.ts`
   - Create `AccountDetailsPanel.tsx`

### THIS WEEK (20-30 hours)
- Complete Phase 1 (audit logs + account details)
- All tests passing
- Deploy to staging

---

## File Reference: Where to Edit

### Audit Logs UI
**Create New Files**:
- `frontend/services/auditLogService.ts` - NEW
- `frontend/components/AuditTimeline.tsx` - NEW

**Edit Existing**:
- `frontend/views/sales/components/QuotationDetails.tsx` - Line 283 (replace "Coming Soon")
- `backend/routes/examination.cjs` - Add audit log endpoint

---

### Account Details Dashboard
**Create New Files**:
- `frontend/services/accountAnalysisService.ts` - NEW
- `frontend/components/AccountDetailsPanel.tsx` - NEW
- `frontend/components/AgingAnalysis.tsx` - NEW

**Edit Existing**:
- `frontend/views/sales/components/CustomerWorkspace.tsx` - Line 1008 (replace "Coming Soon")
- `backend/routes/` - Add account analysis endpoints

---

### 2FA Implementation
**Create New Files**:
- `backend/services/twoFactorService.cjs` - NEW
- `frontend/components/TwoFactorSetup.tsx` - NEW
- `frontend/components/TwoFactorLogin.tsx` - NEW

**Edit Existing**:
- `backend/routes/auth.cjs` - Add 2FA endpoints
- `backend/db.cjs` - Add 2FA columns
- `frontend/views/Settings.tsx` - Line 230 (add 2FA section)
- `frontend/context/AuthContext.tsx` - Add 2FA logic

---

### Internal Transfers
**Create New Files**:
- `backend/services/transferService.cjs` - NEW
- `frontend/components/WarehouseTransferModal.tsx` - NEW
- `frontend/components/TransferWorkflow.tsx` - NEW

**Edit Existing**:
- `backend/db.cjs` - Add transfer tables
- `backend/routes/` - Add transfer endpoints
- `frontend/views/inventory/` - Add transfer UI

---

## Development Checklist

### Phase 1 Checklist
- [ ] Audit log service reading backend logs
- [ ] Audit timeline component displaying changes
- [ ] Integrated into QuotationDetails
- [ ] Account analysis service calculating metrics
- [ ] Account details panel displaying data
- [ ] Aging analysis component working
- [ ] Integrated into CustomerWorkspace
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable (< 2s load)

### Phase 2 Checklist
- [ ] Verified 2FA status
- [ ] 2FA service installed and working
- [ ] Setup flow tested
- [ ] Login requires 2FA
- [ ] Backup codes working
- [ ] Device trust implemented
- [ ] All tests passing
- [ ] No security issues

### Phase 3 Checklist
- [ ] Transfer service working
- [ ] Database tables created
- [ ] Transfer workflow UI complete
- [ ] Approval flow working
- [ ] Stock transfers correct
- [ ] Audit trail maintained
- [ ] All tests passing

---

## Technology Stack

### Phase 1
- **Frontend**: React, TypeScript, Tailwind
- **Backend**: Node.js/Express, SQLite
- **Tools**: Recharts (for aging analysis), date-fns

### Phase 2
- **Additional**: speakeasy (TOTP), qrcode, crypto
- **Standards**: OWASP 2FA Best Practices

### Phase 3
- **Same as existing**: React, Express, SQLite

---

## Testing Requirements

### Phase 1 Tests
```typescript
// Audit logs
✅ Logs only show changes for specific entity
✅ Displays user who made change
✅ Before/after values visible
✅ Chronological order correct
✅ Handles large audit trails

// Account details
✅ Metrics calculated correctly
✅ Aging buckets sum to total
✅ Payment pattern analysis accurate
✅ Risk score between 0-100
✅ Updates when payments received
```

### Phase 2 Tests
```typescript
// 2FA
✅ Secret generated securely
✅ QR code scans correctly
✅ Token verification works
✅ Backup codes work as fallback
✅ Login flow with 2FA complete
✅ Device trust persists
✅ Can disable 2FA
```

### Phase 3 Tests
```typescript
// Transfers
✅ Stock available validated
✅ Workflow states correct
✅ Both warehouses updated correctly
✅ Audit trail maintained
✅ Cannot transfer without approval
```

---

## Performance Targets

| Feature | Target | Current |
|---------|--------|---------|
| **Audit Logs Load** | < 1s | ? |
| **Account Details Load** | < 2s | ? |
| **2FA Setup** | < 500ms | ? |
| **Transfer List** | < 1s | ? |

---

## Deployment Steps

### For Each Phase

```bash
# 1. Create feature branch
git checkout -b feature/audit-logs

# 2. Implement changes
# ... write code ...

# 3. Run tests
npm test

# 4. Commit
git commit -m "feat: implement audit logs UI"

# 5. Push and create PR
git push origin feature/audit-logs

# 6. Merge when approved
# 7. Deploy to staging
npm run deploy:staging

# 8. Test in staging
# 9. Deploy to production
npm run deploy:production
```

---

## Common Issues & Solutions

### Issue: Audit logs very slow
**Solution**: Add indexes
```sql
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### Issue: 2FA codes not syncing
**Solution**: Check time sync
```bash
# Server time must be within 30 seconds of client
ntpdate -u pool.ntp.org
```

### Issue: Account details calculations wrong
**Solution**: Use exact same formula in frontend and backend
- Keep calculations centralized
- Unit test before deploying

---

## Getting Help

**If stuck on**:
- **Audit logs**: Check backend `writeAuditLog()` function format
- **Account details**: Review existing `reportService.ts` for calculation patterns
- **2FA**: Reference speakeasy documentation
- **Transfers**: Look at existing `inventoryTransactionService.ts` logic

---

## Timeline Summary

```
Week 1:     Audit Logs + Account Details     ✅ Ready to deploy
Week 2:     Verify + Complete 2FA            ✅ Production hardened
Week 3:     Internal Transfers (optional)    ✅ Complete feature set
```

**Total Effort**: 31-53 hours (2-3 developers, 1-3 weeks)

---

## Success Indicators

✅ All "Coming Soon" placeholders replaced with working features  
✅ Zero console errors in browser  
✅ 100% of tests passing  
✅ Performance within targets  
✅ Security audit passes  
✅ User feedback positive  

---

**Ready to start? Pick Phase 1 → create branches → implement → test → deploy!**

For detailed implementation steps, see `IMPLEMENTATION_PLAN_5_PERCENT.md`
