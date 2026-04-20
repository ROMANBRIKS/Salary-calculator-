/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COLData, FilingStatus } from './types';

export const TAX_YEARS = Array.from({ length: 2060 - 2026 + 1 }, (_, i) => 2026 + i);

// 2026 OBBBA Assumptions
export const OBBBA_DATA = {
  standardDeduction: {
    single: 16100,
    'married-joint': 32200,
  },
  saltCap: {
    '2026-2029': 40400,
    '2030': 10000,
  },
  overtimeShield: {
    single: 12500,
    'married-joint': 25000,
  },
  tipShield: 25000,
  childCredit: 2200,
  autoLoanDeduction: 10000, // Active thru 2028
};

// Simplified Federal Brackets for 2026 (Forward looking)
export const FEDERAL_BRACKETS_2026 = {
  single: [
    { threshold: 0, rate: 0.10 },
    { threshold: 12000, rate: 0.12 },
    { threshold: 48000, rate: 0.22 },
    { threshold: 100000, rate: 0.24 },
    { threshold: 195000, rate: 0.32 },
    { threshold: 245000, rate: 0.35 },
    { threshold: 650000, rate: 0.37 },
  ],
  'married-joint': [
    { threshold: 0, rate: 0.10 },
    { threshold: 24000, rate: 0.12 },
    { threshold: 96000, rate: 0.22 },
    { threshold: 200000, rate: 0.24 },
    { threshold: 390000, rate: 0.32 },
    { threshold: 490000, rate: 0.35 },
    { threshold: 730000, rate: 0.37 },
  ],
};

// Simplified FICA (7.65% up to limit)
export const FICA_RATE = 0.0765;
export const SS_LIMIT = 184500; // Updated 2026 limit

// Cost of Living Index by State (Randomized for 2026-2030 projections)
// 100 is base. 1.2 means things cost 20% more.
export const STATE_COL_DATA: Record<string, COLData> = {
  'TX': { state: 'Texas', index: 92.5, purchasingPowerMultiplier: 1.08 },
  'CA': { state: 'California', index: 138.5, purchasingPowerMultiplier: 0.72 },
  'NY': { state: 'New York', index: 135.2, purchasingPowerMultiplier: 0.74 },
  'FL': { state: 'Florida', index: 100.3, purchasingPowerMultiplier: 1.00 },
  'WA': { state: 'Washington', index: 115.1, purchasingPowerMultiplier: 0.87 },
  'IL': { state: 'Illinois', index: 94.3, purchasingPowerMultiplier: 1.06 },
  'MA': { state: 'Massachusetts', index: 129.7, purchasingPowerMultiplier: 0.77 },
  'NV': { state: 'Nevada', index: 102.1, purchasingPowerMultiplier: 0.98 },
  'TN': { state: 'Tennessee', index: 89.8, purchasingPowerMultiplier: 1.11 },
  'NC': { state: 'North Carolina', index: 91.2, purchasingPowerMultiplier: 1.10 },
  'WY': { state: 'Wyoming', index: 84.6, purchasingPowerMultiplier: 1.182 },
};

// Simplified State Tax Rates
export const STATE_TAX_RATES: Record<string, number> = {
  'TX': 0,
  'CA': 0.093, // Simplified flat-ish for example
  'NY': 0.065,
  'FL': 0,
  'WA': 0,
  'IL': 0.0495,
  'MA': 0.05,
  'NV': 0,
  'TN': 0,
  'NC': 0.0475,
};
