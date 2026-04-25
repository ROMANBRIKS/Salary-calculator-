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
  'AL': { state: 'Alabama', index: 88.1, purchasingPowerMultiplier: 1.13 },
  'AK': { state: 'Alaska', index: 126.3, purchasingPowerMultiplier: 0.79 },
  'AZ': { state: 'Arizona', index: 107.2, purchasingPowerMultiplier: 0.93 },
  'AR': { state: 'Arkansas', index: 85.3, purchasingPowerMultiplier: 1.17 },
  'CA': { state: 'California', index: 138.5, purchasingPowerMultiplier: 0.72 },
  'CO': { state: 'Colorado', index: 105.4, purchasingPowerMultiplier: 0.95 },
  'CT': { state: 'Connecticut', index: 115.2, purchasingPowerMultiplier: 0.87 },
  'DE': { state: 'Delaware', index: 102.3, purchasingPowerMultiplier: 0.98 },
  'DC': { state: 'District of Columbia', index: 145.7, purchasingPowerMultiplier: 0.69 },
  'FL': { state: 'Florida', index: 101.2, purchasingPowerMultiplier: 0.99 },
  'GA': { state: 'Georgia', index: 90.4, purchasingPowerMultiplier: 1.11 },
  'HI': { state: 'Hawaii', index: 180.2, purchasingPowerMultiplier: 0.55 },
  'ID': { state: 'Idaho', index: 101.1, purchasingPowerMultiplier: 0.99 },
  'IL': { state: 'Illinois', index: 92.3, purchasingPowerMultiplier: 1.08 },
  'IN': { state: 'Indiana', index: 90.1, purchasingPowerMultiplier: 1.11 },
  'IA': { state: 'Iowa', index: 89.2, purchasingPowerMultiplier: 1.12 },
  'KS': { state: 'Kansas', index: 87.4, purchasingPowerMultiplier: 1.14 },
  'KY': { state: 'Kentucky', index: 89.3, purchasingPowerMultiplier: 1.12 },
  'LA': { state: 'Louisiana', index: 91.2, purchasingPowerMultiplier: 1.10 },
  'ME': { state: 'Maine', index: 111.4, purchasingPowerMultiplier: 0.90 },
  'MD': { state: 'Maryland', index: 120.3, purchasingPowerMultiplier: 0.83 },
  'MA': { state: 'Massachusetts', index: 148.2, purchasingPowerMultiplier: 0.67 },
  'MI': { state: 'Michigan', index: 91.3, purchasingPowerMultiplier: 1.10 },
  'MN': { state: 'Minnesota', index: 94.2, purchasingPowerMultiplier: 1.06 },
  'MS': { state: 'Mississippi', index: 85.1, purchasingPowerMultiplier: 1.18 },
  'MO': { state: 'Missouri', index: 89.4, purchasingPowerMultiplier: 1.12 },
  'MT': { state: 'Montana', index: 103.2, purchasingPowerMultiplier: 0.97 },
  'NE': { state: 'Nebraska', index: 91.4, purchasingPowerMultiplier: 1.10 },
  'NV': { state: 'Nevada', index: 102.1, purchasingPowerMultiplier: 0.98 },
  'NH': { state: 'New Hampshire', index: 114.3, purchasingPowerMultiplier: 0.88 },
  'NJ': { state: 'New Jersey', index: 112.2, purchasingPowerMultiplier: 0.89 },
  'NM': { state: 'New Mexico', index: 93.4, purchasingPowerMultiplier: 1.07 },
  'NY': { state: 'New York', index: 135.2, purchasingPowerMultiplier: 0.74 },
  'NC': { state: 'North Carolina', index: 96.1, purchasingPowerMultiplier: 1.04 },
  'ND': { state: 'North Dakota', index: 94.3, purchasingPowerMultiplier: 1.06 },
  'OH': { state: 'Ohio', index: 91.1, purchasingPowerMultiplier: 1.10 },
  'OK': { state: 'Oklahoma', index: 86.2, purchasingPowerMultiplier: 1.16 },
  'OR': { state: 'Oregon', index: 115.4, purchasingPowerMultiplier: 0.87 },
  'PA': { state: 'Pennsylvania', index: 99.2, purchasingPowerMultiplier: 1.01 },
  'RI': { state: 'Rhode Island', index: 113.4, purchasingPowerMultiplier: 0.88 },
  'SC': { state: 'South Carolina', index: 95.2, purchasingPowerMultiplier: 1.05 },
  'SD': { state: 'South Dakota', index: 101.3, purchasingPowerMultiplier: 0.99 },
  'TN': { state: 'Tennessee', index: 90.1, purchasingPowerMultiplier: 1.11 },
  'TX': { state: 'Texas', index: 93.5, purchasingPowerMultiplier: 1.07 },
  'UT': { state: 'Utah', index: 103.4, purchasingPowerMultiplier: 0.97 },
  'VT': { state: 'Vermont', index: 116.2, purchasingPowerMultiplier: 0.86 },
  'VA': { state: 'Virginia', index: 103.1, purchasingPowerMultiplier: 0.97 },
  'WA': { state: 'Washington', index: 115.1, purchasingPowerMultiplier: 0.87 },
  'WV': { state: 'West Virginia', index: 89.1, purchasingPowerMultiplier: 1.12 },
  'WI': { state: 'Wisconsin', index: 95.3, purchasingPowerMultiplier: 1.05 },
  'WY': { state: 'Wyoming', index: 92.4, purchasingPowerMultiplier: 1.08 },
};

// Simplified State Tax Rates (Projected for 2026/Forward-Looking)
export const STATE_TAX_RATES: Record<string, number> = {
  'AL': 0.05,
  'AK': 0,
  'AZ': 0.025,
  'AR': 0.044,
  'CA': 0.093,
  'CO': 0.044,
  'CT': 0.0699,
  'DE': 0.066,
  'DC': 0.0895,
  'FL': 0,
  'GA': 0.0549,
  'HI': 0.11,
  'ID': 0.058,
  'IL': 0.0495,
  'IN': 0.0305,
  'IA': 0.038, // Iowa moving fast to low flat tax
  'KS': 0.057,
  'KY': 0.04,
  'LA': 0.0425,
  'ME': 0.0715,
  'MD': 0.0575,
  'MA': 0.05,
  'MI': 0.0425,
  'MN': 0.0985,
  'MS': 0.05,
  'MO': 0.048,
  'MT': 0.059,
  'NE': 0.0584,
  'NV': 0,
  'NH': 0,
  'NJ': 0.0637,
  'NM': 0.059,
  'NY': 0.065,
  'NC': 0.045,
  'ND': 0.029,
  'OH': 0.035,
  'OK': 0.0475,
  'OR': 0.0875,
  'PA': 0.0307,
  'RI': 0.0599,
  'SC': 0.07,
  'SD': 0,
  'TN': 0,
  'TX': 0,
  'UT': 0.0465,
  'VT': 0.0875,
  'VA': 0.0575,
  'WA': 0,
  'WV': 0.0512,
  'WI': 0.053,
  'WY': 0,
};
