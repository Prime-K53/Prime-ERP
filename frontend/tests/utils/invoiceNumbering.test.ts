import { describe, it, expect } from 'vitest';
import { assertInvoiceNumberFormat, generateNextId } from '../../utils/helpers';
import { CompanyConfig } from '../../types';

const buildSharedConfig = (padding: number): CompanyConfig => ({
  transactionSettings: {
    numbering: {
      shared: {
        prefix: '',
        startNumber: 1,
        padding
      }
    }
  }
} as CompanyConfig);

const buildLegacyInvoiceConfig = (padding: number): CompanyConfig => ({
  transactionSettings: {
    numbering: {
      invoice: {
        prefix: 'INV',
        startNumber: 1,
        padding
      }
    }
  }
} as CompanyConfig);

describe('invoice numbering padding', () => {
  it('pads invoice numbers to configured length', () => {
    const config = buildSharedConfig(5);
    const first = generateNextId('invoice', [], config);
    const second = generateNextId('invoice', [{ id: first, date: '2026-01-01' }], config);
    expect(first).toBe('INV-00001');
    expect(second).toBe('INV-00002');
  });

  it('uses built-in prefixes for non-invoice documents with the shared rule', () => {
    const config = buildSharedConfig(3);
    expect(generateNextId('quotation', [], config)).toBe('QTN-001');
    expect(generateNextId('customer', [], config)).toBe('CUST-001');
  });

  it('keeps legacy invoice settings working', () => {
    const config = buildLegacyInvoiceConfig(4);
    expect(generateNextId('invoice', [], config)).toBe('INV-0001');
  });

  it('validates invoice number format against padding', () => {
    const config = buildSharedConfig(3);
    expect(() => assertInvoiceNumberFormat('INV-001', config, 'invoice')).not.toThrow();
    expect(() => assertInvoiceNumberFormat('INV-01', config, 'invoice')).toThrow();
  });
});
