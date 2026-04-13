# Prime ERP - 5% Completion Implementation Plan

**Project**: Complete remaining features to reach 100% functionality  
**Start Date**: April 11, 2026  
**Target Completion**: 2-3 weeks (31-53 hours total development)  
**Priority**: Complete Phase 1 first, defer Phase 3

---

## PROJECT OVERVIEW

The Prime ERP application is **95%+ complete**. This plan outlines implementation of the remaining 5% of features:

1. **Audit Logs User Interface** (5-7 hours) - Display backend audit data
2. **Full Account Details Dashboard** (4-6 hours) - Customer financial analytics
3. **Verify & Complete 2FA** (2-4 + 12-16 hours) - Two-factor authentication
4. **Internal Transfer Feature** (8-10 hours) - Warehouse transfers

**Total Estimated Effort**: 31-53 hours

---

## PHASE 1: QUICK WINS (2-3 days)

### Feature 1.1: Audit Logs Display UI

**Status**: Backend ✅ Complete | Frontend ❌ Missing  
**Complexity**: MEDIUM (UI layer only)  
**Estimated Effort**: 5-7 hours  
**Priority**: HIGH (users want to see changes)

#### File Analysis
Backend audit logs are fully implemented in:
- `backend/services/examinationService.cjs` - writeAuditLog() function
- Database table: `audit_logs` with columns:
  - id, timestamp, user_id, action, entity_type, entity_id, details, old_value, new_value, correlation_id, integrity_hash

#### Required Implementation

**1. Create Audit Log Service** `frontend/services/auditLogService.ts`
```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  oldValue: any;
  newValue: any;
  correlationId?: string;
}

export const auditLogService = {
  getAuditLogs(entityType: string, entityId: string): Promise<AuditLogEntry[]>
  getAuditTrail(correlationId: string): Promise<AuditLogEntry[]>
  formatChange(oldValue: any, newValue: any): string
}
```

**2. Create Audit Timeline Component** `frontend/components/AuditTimeline.tsx`
```typescript
// Displays chronological changes with:
// - Timestamp
// - User who made change
// - Field changed
// - Old Value → New Value
// - Action Type (Create/Update/Delete/Approve)
// - Reason (if available)
```

**3. Add to Quotation Details** `frontend/views/sales/components/QuotationDetails.tsx`
Replace "Coming Soon" placeholder at line 283:
```typescript
{/* Audit Logs Section */}
<div className="rounded-2xl border border-slate-200 p-6 mt-6">
  <h3 className="font-bold text-slate-900 mb-4">Change History</h3>
  <AuditTimeline 
    entityType="quotation" 
    entityId={quotation.id}
  />
</div>
```

**4. Create Audit Log API Endpoint** `backend/routes/examination.cjs`
```javascript
router.get('/audit-logs/:entityType/:entityId', async (req, res) => {
  const { entityType, entityId } = req.params;
  try {
    const logs = await getAuditLogs(entityType, entityId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

#### Acceptance Criteria
- ✅ Audit logs display in chronological order
- ✅ Shows user who made change
- ✅ Shows before/after values
- ✅ Groups changes by transaction (correlationId)
- ✅ Drill-down to see full details
- ✅ Search by user/date/action
- ✅ Read-only display (no editing)

#### Testing
```typescript
// Verify audit log captures:
test('Quotation change creates audit log entry', async () => {
  const originalStatus = quotation.status;
  await updateQuotation(id, { status: 'Approved' });
  const logs = await getAuditLogs('quotation', id);
  expect(logs[0].oldValue).toBe(originalStatus);
  expect(logs[0].newValue).toBe('Approved');
});
```

---

### Feature 1.2: Full Account Details Dashboard

**Status**: Backend ✅ Partial | Frontend ❌ Missing  
**Complexity**: MEDIUM (aggregation layer)  
**Estimated Effort**: 4-6 hours  
**Priority**: HIGH (sales team needs this)

#### Current State
- ✅ Customer basic info works
- ✅ Transaction history available
- ✅ Payment history available
- ❌ Analysis dashboard missing
- ❌ Credit analysis missing
- ❌ Aging analysis missing

#### Required Implementation

**1. Create Account Analysis Service** `frontend/services/accountAnalysisService.ts`
```typescript
interface AccountAnalysis {
  totalSales: number;
  totalPaid: number;
  totalDue: number;
  accountAge: number; // days
  creditLimit: number;
  availableCredit: number;
  avgPaymentDays: number;
  paymentPattern: 'Early' | 'OnTime' | 'Late' | 'Irregular';
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const accountAnalysisService = {
  calculateAccountMetrics(customerId: string): Promise<AccountAnalysis>
  getAgingAnalysis(customerId: string): Promise<AgeingBucket[]>
  predictedPaymentDate(invoiceId: string): Promise<Date>
  getCreditRiskScore(customerId: string): Promise<number>
}
```

**2. Create Account Details Panel** `frontend/components/AccountDetailsPanel.tsx`
```typescript
// Display:
// - Account Summary (total due, paid, credit limit)
// - Account Age
// - Payment Behavior Analysis
// - Aging Analysis (0-30, 30-60, 60-90, 90+ days)
// - Payment Pattern (chart)
// - Credit Risk Indicator
// - Contact History Timeline
```

**3. Create Aging Analysis Component** `frontend/components/AgingAnalysis.tsx`
```typescript
interface AgeingBucket {
  bucket: '0-30' | '30-60' | '60-90' | '90+';
  amount: number;
  percentage: number;
  invoices: Invoice[];
}

// Display as:
// - Horizontal stacked bar chart
// - Color coded (green → red for age)
// - Click to drill into invoices
```

**4. Update Customer Workspace** `frontend/views/sales/components/CustomerWorkspace.tsx`
Replace placeholder at line 1008:
```typescript
{/* Full Account Details Tab */}
{activeTab === 'account-details' && (
  <div className="p-6">
    <AccountDetailsPanel customer={customer} />
  </div>
)}
```

**5. Add Backend Endpoint** `backend/routes/` (if not exists)
```javascript
// Get account metrics
router.get('/customers/:id/account-analysis', async (req, res) => {
  const analysis = await accountAnalysisService.calculateMetrics(req.params.id);
  res.json(analysis);
});

// Get aging analysis
router.get('/customers/:id/aging', async (req, res) => {
  const aging = await accountAnalysisService.getAgingAnalysis(req.params.id);
  res.json(aging);
});
```

#### Calculations Required

**Payment Pattern Analysis**:
```javascript
// Analyze last 10 payments
function analyzePaymentPattern(payments) {
  const differences = payments.map((p, i) => 
    i === 0 ? 0 : daysUntilDue(payments[i-1]) - daysUntilDue(p)
  );
  
  const avgDifference = differences.reduce((a,b) => a+b) / differences.length;
  
  if (avgDifference < 0) return 'Early'; // Pays before due
  if (Math.abs(avgDifference) <= 7) return 'OnTime'; // Within week
  if (avgDifference < 30) return 'Late'; // Pays within month late
  return 'Irregular'; // Unpredictable
}
```

**Credit Risk Score** (0-100):
```javascript
function calculateCreditRiskScore(customer) {
  let score = 50; // Base
  
  // Payment history (±20 points)
  if (customer.paymentPattern === 'Early') score += 20;
  else if (customer.paymentPattern === 'OnTime') score += 10;
  else if (customer.paymentPattern === 'Late') score -= 15;
  else if (customer.paymentPattern === 'Irregular') score -= 20;
  
  // Credit utilization (±15 points)
  const utilization = customer.totalDue / customer.creditLimit;
  score -= (utilization * 15); // High usage = higher risk
  
  // Account age (±10 points)
  if (customer.accountAge < 30) score -= 10; // New customer
  else if (customer.accountAge > 365) score += 5; // Established
  
  // Current overdue (±15 points)
  if (customer.overdueDays > 30) score -= 15;
  else if (customer.overdueDays > 90) score -= 25;
  
  return Math.max(0, Math.min(100, score));
}
```

#### Acceptance Criteria
- ✅ Displays account summary (balance, credit limit, available)
- ✅ Shows aging analysis with color coding
- ✅ Payment pattern analysis visible
- ✅ Credit risk score calculated
- ✅ Click on aging bucket shows invoices
- ✅ Handles missing data gracefully
- ✅ Updates when payments received
- ✅ Performance acceptable (< 2s load)

#### Testing
```typescript
test('Account analysis calculates correct metrics', async () => {
  const analysis = await accountAnalysisService.calculateAccountMetrics(customerId);
  expect(analysis.totalDue).toBeGreaterThan(0);
  expect(analysis.paymentPattern).toMatch(/Early|OnTime|Late|Irregular/);
  expect(analysis.riskLevel).toMatch(/Low|Medium|High/);
});
```

---

## PHASE 2: SECURITY FEATURES (3-5 days)

### Feature 2.1: Verify 2FA Implementation Status

**Status**: Unknown (toggle exists, needs verification)  
**Complexity**: VARIABLE  
**Estimated Effort**: 2-4 hours (verification) + 0-16 hours (completion)  
**Priority**: MEDIUM-HIGH (security critical)

#### Verification Checklist

**Step 1: Check Frontend Implementation**
- [ ] Look in `frontend/views/Settings.tsx` around line 230
- [ ] Check for 2FA toggle component
- [ ] Check if 2FA setup modal exists
- [ ] Check if TOTP/SMS/Email options available

**Step 2: Check Backend Implementation**
- [ ] Search `backend/` for 2FA logic
- [ ] Look for speakeasy or TOTP libraries in package.json
- [ ] Check if secrets are stored (encrypted)
- [ ] Check if backup codes exist
- [ ] Verify 2FA is checked during login

**Step 3: Check Authentication Flow**
- [ ] Is 2FA required field in user table?
- [ ] Are backup codes stored?
- [ ] Is device trust implemented?
- [ ] Can user disable 2FA?

#### Files to Check
```
frontend/
  ├── views/Settings.tsx (lines 200-300)
  ├── context/AuthContext.tsx (lines 1-100)
  └── components/2FA* (search for any 2FA components)

backend/
  ├── index.cjs (search for 2FA)
  ├── package.json (search for speakeasy, totp)
  └── routes/ (search for 2FA endpoint)
```

---

### Feature 2.2: Complete 2FA Implementation (If Needed)

**Status**: Conditional on verification  
**Complexity**: HIGH  
**Estimated Effort**: 12-16 hours  
**Priority**: HIGH (post-launch security)

#### If 2FA Is NOT Implemented, Build It

**1. Install Dependencies**
```bash
npm install speakeasy qrcode --save
npm install @types/speakeasy --save-dev
```

**2. Create 2FA Service** `backend/services/twoFactorService.cjs`
```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

module.exports = {
  // Generate secret for user
  generateSecret(userEmail) {
    return speakeasy.generateSecret({
      name: `Prime ERP (${userEmail})`,
      issuer: 'Prime ERP',
      length: 32
    });
  },

  // Generate QR code
  async generateQRCode(secret) {
    return await QRCode.toDataURL(secret.otpauth_url);
  },

  // Verify token
  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 windows (±30 seconds)
    });
  },

  // Generate backup codes
  generateBackupCodes(count = 10) {
    return Array.from({ length: count }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }
};
```

**3. Update User Schema** `backend/db.cjs`
```sql
ALTER TABLE users ADD COLUMN 
  two_factor_enabled INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN 
  two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN 
  two_factor_backup_codes TEXT; -- JSON array
ALTER TABLE users ADD COLUMN 
  two_factor_verified_at DATETIME;
```

**4. Create 2FA Setup Endpoint** `backend/routes/auth.cjs`
```javascript
router.post('/2fa/setup', requireAuth, async (req, res) => {
  const { userId } = req.user;
  const twoFactorService = require('../services/twoFactorService.cjs');
  
  const secret = twoFactorService.generateSecret(req.user.email);
  const qrCode = await twoFactorService.generateQRCode(secret);
  const backupCodes = twoFactorService.generateBackupCodes();
  
  // Store temporarily (not yet verified)
  req.session.pendingTwoFactor = {
    secret: secret.base32,
    backupCodes: backupCodes,
    createdAt: Date.now()
  };
  
  res.json({
    qrCode,
    secret: secret.base32,
    backupCodes // Show to user to save
  });
});

router.post('/2fa/verify', requireAuth, async (req, res) => {
  const { token } = req.body;
  const twoFactorService = require('../services/twoFactorService.cjs');
  
  if (!req.session.pendingTwoFactor) {
    return res.status(400).json({ error: 'No setup in progress' });
  }
  
  const isValid = twoFactorService.verifyToken(
    req.session.pendingTwoFactor.secret,
    token
  );
  
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid 2FA token' });
  }
  
  // Save to database
  const backup_codes = JSON.stringify(req.session.pendingTwoFactor.backupCodes);
  await updateUser(req.user.userId, {
    two_factor_enabled: 1,
    two_factor_secret: req.session.pendingTwoFactor.secret,
    two_factor_backup_codes: backup_codes,
    two_factor_verified_at: new Date().toISOString()
  });
  
  delete req.session.pendingTwoFactor;
  
  res.json({ 
    success: true,
    backupCodes: req.session.pendingTwoFactor.backupCodes
  });
});
```

**5. Update Login Endpoint** `backend/routes/auth.cjs`
```javascript
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (user.two_factor_enabled) {
    // Send 2FA challenge, don't finish login yet
    req.session.awaitingTwoFactor = {
      userId: user.id,
      createdAt: Date.now()
    };
    
    return res.json({
      requiresTwoFactor: true,
      message: 'Enter your 2FA code'
    });
  }
  
  // Normal login
  req.session.userId = user.id;
  res.json({ success: true, user });
});

router.post('/login/2fa', async (req, res) => {
  const { token, useBackupCode } = req.body;
  
  if (!req.session.awaitingTwoFactor) {
    return res.status(400).json({ error: 'No 2FA in progress' });
  }
  
  const user = await getUserById(req.session.awaitingTwoFactor.userId);
  const twoFactorService = require('../services/twoFactorService.cjs');
  
  let isValid = false;
  
  if (useBackupCode) {
    // Check backup codes
    const codes = JSON.parse(user.two_factor_backup_codes || '[]');
    if (codes.includes(token)) {
      isValid = true;
      // Remove used code
      const updatedCodes = codes.filter(c => c !== token);
      await updateUser(user.id, {
        two_factor_backup_codes: JSON.stringify(updatedCodes)
      });
    }
  } else {
    // Check TOTP code
    isValid = twoFactorService.verifyToken(user.two_factor_secret, token);
  }
  
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid 2FA code' });
  }
  
  // Complete login
  req.session.userId = user.id;
  delete req.session.awaitingTwoFactor;
  
  res.json({ success: true, user });
});
```

**6. Create 2FA Setup Component** `frontend/components/TwoFactorSetup.tsx`
```typescript
export const TwoFactorSetup: React.FC = () => {
  const [step, setStep] = useState<'start' | 'qr' | 'verify' | 'backup'>('start');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyToken, setVerifyToken] = useState('');
  
  const handleSetupStart = async () => {
    const response = await api.post('/2fa/setup');
    setQrCode(response.qrCode);
    setSecret(response.secret);
    setBackupCodes(response.backupCodes);
    setStep('qr');
  };
  
  const handleVerify = async () => {
    await api.post('/2fa/verify', { token: verifyToken });
    setStep('backup');
  };
  
  return (
    <div>
      {step === 'start' && (
        <button onClick={handleSetupStart}>Enable 2FA</button>
      )}
      
      {step === 'qr' && (
        <div>
          <h3>Scan with Authenticator App</h3>
          <img src={qrCode} alt="QR Code" />
          <p>Or enter manually: {secret}</p>
          <input 
            placeholder="Enter 6-digit code" 
            value={verifyToken}
            onChange={e => setVerifyToken(e.target.value)}
            maxLength={6}
          />
          <button onClick={handleVerify}>Verify</button>
        </div>
      )}
      
      {step === 'backup' && (
        <div>
          <h3>Save Backup Codes</h3>
          <p>Keep these safe - use them if you lose access to your authenticator</p>
          {backupCodes.map(code => (
            <code key={code}>{code}</code>
          ))}
          <button onClick={() => setStep('start')}>Done</button>
        </div>
      )}
    </div>
  );
};
```

**7. Create 2FA Login Component** `frontend/components/TwoFactorLogin.tsx`
```typescript
export const TwoFactorLogin: React.FC = () => {
  const [token, setToken] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  
  const handleSubmit = async () => {
    await api.post('/login/2fa', { 
      token, 
      useBackupCode 
    });
    // Redirect to dashboard
  };
  
  return (
    <div>
      <input 
        placeholder={useBackupCode ? "Enter backup code" : "Enter 6-digit code"}
        value={token}
        onChange={e => setToken(e.target.value)}
        maxLength={useBackupCode ? 8 : 6}
      />
      <button onClick={handleSubmit}>Verify</button>
      <button onClick={() => setUseBackupCode(!useBackupCode)}>
        {useBackupCode ? 'Use Authenticator' : 'Use Backup Code'}
      </button>
    </div>
  );
};
```

**8. Update Settings** `frontend/views/Settings.tsx`
```typescript
{/* 2FA Section */}
<div className="border border-slate-200 rounded-2xl p-6 mt-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="font-bold text-slate-900">Two-Factor Authentication</h3>
    {user.two_factor_enabled ? (
      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
        Enabled
      </span>
    ) : (
      <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
        Disabled
      </span>
    )}
  </div>
  
  <p className="text-sm text-slate-600 mb-4">
    Add extra security to your account with two-factor authentication.
  </p>
  
  {!user.two_factor_enabled ? (
    <TwoFactorSetup />
  ) : (
    <div>
      <button onClick={handleDisable2FA}>Disable 2FA</button>
      <button onClick={handleRegenerate2FA}>Regenerate Codes</button>
    </div>
  )}
</div>
```

#### Acceptance Criteria
- ✅ User can enable 2FA via authenticator app
- ✅ QR code generated and scanned correctly
- ✅ Backup codes generated and displayed
- ✅ Login requires 2FA token when enabled
- ✅ Backup codes work as fallback
- ✅ Device trust option available
- ✅ User can disable 2FA if needed
- ✅ Codes work for 2 time windows
- ✅ Logs all 2FA events

#### Testing
```typescript
test('2FA setup flow works end-to-end', async () => {
  // Start setup
  const setup = await api.post('/2fa/setup');
  expect(setup.qrCode).toBeTruthy();
  expect(setup.backupCodes.length).toBe(10);
  
  // Verify token
  const token = generateTOTPToken(setup.secret);
  const verify = await api.post('/2fa/verify', { token });
  expect(verify.success).toBe(true);
  
  // Login requires 2FA
  const login = await api.post('/login', { email, password });
  expect(login.requiresTwoFactor).toBe(true);
  
  // 2FA completes login
  const finalLogin = await api.post('/login/2fa', { token });
  expect(finalLogin.success).toBe(true);
});
```

---

## PHASE 3: NICE-TO-HAVE FEATURES (1-2 weeks)

### Feature 3.1: Internal Transfer Feature

**Status**: Not started  
**Complexity**: HIGH (workflow + UI)  
**Estimated Effort**: 8-10 hours  
**Priority**: LOW (manual process works)

#### Overview
Transfer inventory items between warehouses with:
- Transfer request creation
- Approval workflow
- In-transit tracking
- Cost allocation
- Receiving and reconciliation

#### Implementation

**1. Create Transfer Service** `backend/services/transferService.cjs`
```javascript
module.exports = {
  // Create transfer request
  createTransfer(fromWarehouse, toWarehouse, items, reason) {
    // Validate stock available
    // Create transfer record
    // Create audit log
  },

  // Approve transfer
  approveTransfer(transferId, approvedBy) {
    // Validate approver role
    // Update status to "Approved"
    // Trigger shipment
  },

  // Receive transfer
  receiveTransfer(transferId, items, receivedBy) {
    // Validate quantities
    // Update warehouse stock
    // Complete transfer
  },

  // Generate transfer document
  generateTransferDocument(transferId) {
    // Create PDF with items, quantities, route
  }
};
```

**2. Update Database Schema**
```sql
CREATE TABLE warehouse_transfers (
  id TEXT PRIMARY KEY,
  from_warehouse_id TEXT NOT NULL,
  to_warehouse_id TEXT NOT NULL,
  status TEXT DEFAULT 'Draft',
  reason TEXT,
  created_by TEXT,
  created_at DATETIME,
  approved_by TEXT,
  approved_at DATETIME,
  shipped_at DATETIME,
  received_at DATETIME,
  FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
  FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id)
);

CREATE TABLE warehouse_transfer_items (
  id TEXT PRIMARY KEY,
  transfer_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity_shipped REAL,
  quantity_received REAL,
  cost_per_unit REAL,
  total_cost REAL,
  FOREIGN KEY (transfer_id) REFERENCES warehouse_transfers(id),
  FOREIGN KEY (item_id) REFERENCES inventory(id)
);
```

**3. Create Transfer Component** `frontend/components/WarehouseTransferModal.tsx`
```typescript
// UI for:
// - Select from/to warehouse
// - Add items (with available qty check)
// - Enter quantities
// - Add reason
// - Submit for approval
// - Track status
```

**4. Create Transfer Workflow** `frontend/components/TransferWorkflow.tsx`
```typescript
// Show stages:
// Draft → Pending Approval → Approved → Shipped → In Transit → Received → Complete
```

#### Acceptance Criteria
- ✅ Create transfer request with items and quantities
- ✅ Validate source warehouse has stock
- ✅ Submit for approval by warehouse manager
- ✅ Approve/reject transfer
- ✅ Ship transfer (reduce source warehouse)
- ✅ Receive transfer (increase destination warehouse)
- ✅ Track in-transit items
- ✅ Generate transfer documents
- ✅ Full audit trail

#### Testing
```typescript
test('Transfer flow completes successfully', async () => {
  // Create transfer
  const transfer = await createTransfer({
    from: warehouse1.id,
    to: warehouse2.id,
    items: [{ id: item1.id, qty: 100 }]
  });
  expect(transfer.status).toBe('Draft');
  
  // Approve
  await approveTransfer(transfer.id);
  const approved = await getTransfer(transfer.id);
  expect(approved.status).toBe('Approved');
  
  // Ship and receive
  await receiveTransfer(transfer.id, [{ id: item1.id, qty: 100 }]);
  const completed = await getTransfer(transfer.id);
  expect(completed.status).toBe('Complete');
  
  // Verify stock
  const w1 = await getWarehouse(warehouse1.id);
  const w2 = await getWarehouse(warehouse2.id);
  expect(w1.stock[item1.id]).toBe(initialStock - 100);
  expect(w2.stock[item1.id]).toBe(initialStock + 100);
});
```

---

## IMPLEMENTATION TIMELINE

### Week 1: Phase 1 (Quick Wins)
- **Day 1**: Audit Logs Service & Component (5-7 hrs)
- **Day 2**: Account Details Dashboard (4-6 hrs)
- **Day 3**: Testing & Integration (2-3 hrs)

**Deliverables**: Audit logs visible in all modules, customer account analysis working

### Week 2: Phase 2 (Security)
- **Day 1**: Verify 2FA Status (2-4 hrs)
- **Day 2-3**: Complete 2FA if needed (12-16 hrs)
- **Day 4**: Testing 2FA flow (3-4 hrs)

**Deliverables**: 2FA fully functional and tested

### Week 3: Phase 3 (Nice-to-Have)
- **Day 1-2**: Internal Transfer Service (8-10 hrs)
- **Day 3**: Testing Transfer flow (2-3 hrs)

**Deliverables**: Internal transfers working end-to-end (optional)

---

## RESOURCE REQUIREMENTS

| Resource | Quantity | Hours |
|----------|----------|-------|
| **Backend Developer** | 1 | 20-25 hrs |
| **Frontend Developer** | 1 | 25-35 hrs |
| **QA/Tester** | 1 | 8-12 hrs |
| **Total Person-Hours** | 3 | 53-72 hrs |

---

## RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| 2FA incomplete | MEDIUM | HIGH | Verify first, allocate 16hrs if needed |
| Audit logs slow | LOW | MEDIUM | Add indexing on audit_logs table |
| API rate limits | LOW | MEDIUM | Implement caching layer |
| Data inconsistency | LOW | HIGH | Comprehensive testing before deploy |

---

## DEPLOYMENT STRATEGY

### Phase 1 & 2 Deployment (Automatic)
- Deploy to staging first
- Run test suite
- Deploy to production with feature flags

### Phase 3 Deployment (Optional)
- Behind feature flag initially
- Deploy after Phase 1 & 2 verified
- Can be deployed independently if needed

### Rollback Plan
- All changes include reversions
- Feature flags allow instant disable
- Database schema changes have migration down scripts

---

## SUCCESS CRITERIA

✅ **Phase 1 Complete**: Audit logs and account details visible  
✅ **Phase 2 Complete**: 2FA functional and tested  
✅ **Phase 3 Complete**: Internal transfers working  
✅ **All Tests Pass**: 100% test coverage on new features  
✅ **Performance**: All new features load in < 2 seconds  
✅ **Security**: 2FA follows OWASP standards  
✅ **Documentation**: All new endpoints documented  

---

## NEXT STEPS

1. **Verify 2FA Status** (highest priority)
   - Check current implementation depth
   - Determine if it's partially done or starting from scratch

2. **Start Phase 1**
   - Create audit log service in parallel with account details
   - Both can be worked on simultaneously

3. **Schedule Phase 2**
   - Plan 2FA implementation based on verification results
   - May take 4-36 hours depending on current state

4. **Plan Phase 3** (optional)
   - Discuss with stakeholders if internal transfers are needed
   - May defer to post-launch

**Estimated Total Completion**: 2-3 weeks with 1-2 developers

---

*Last Updated: April 11, 2026*  
*Status: Ready for Implementation*
