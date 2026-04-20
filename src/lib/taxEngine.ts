/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilingStatus, TaxResult, TaxYear } from '../types';
import { OBBBA_DATA, FEDERAL_BRACKETS_2026, FICA_RATE, SS_LIMIT, STATE_TAX_RATES } from '../constants';

export function calculateTaxes(
  grossPay: number,
  state: string,
  filingStatus: FilingStatus,
  year: TaxYear,
  extras: { 
    overtimePay: number, 
    tipIncome: number, 
    children: number, 
    autoLoanInterest: number,
    assumedInflation: number
  }
): TaxResult {
  // 1. Inflation Factor (C-CPI-U Predictive Engine 2031-2060)
  // For years > 2030, we adjust brackets and deductions by inflation
  let inflationFactor = 1;
  if (year > 2030) {
    const yearsProjected = year - 2026;
    inflationFactor = Math.pow(1 + (extras.assumedInflation / 100), yearsProjected);
  }

  // 2. Adjust Standard Deduction & Brackets for Inflation
  const standardDeduction = OBBBA_DATA.standardDeduction[filingStatus] * inflationFactor;
  const saltCap = (year >= 2026 && year < 2030) ? OBBBA_DATA.saltCap['2026-2029'] : OBBBA_DATA.saltCap['2030'];

  // 3. OBBBA Specific Deductions (Legislative Vault 2026-2030)
  let obbbaDeductions = 0;
  if (year >= 2026 && year <= 2030) {
    obbbaDeductions += Math.min(extras.overtimePay, OBBBA_DATA.overtimeShield[filingStatus]);
    obbbaDeductions += Math.min(extras.tipIncome, OBBBA_DATA.tipShield);
    if (year <= 2028) {
      obbbaDeductions += Math.min(extras.autoLoanInterest, OBBBA_DATA.autoLoanDeduction);
    }
  }

  // 4. Calculate State Tax
  const stateTaxRate = STATE_TAX_RATES[state] || 0.05;
  let rawStateTax = grossPay * stateTaxRate;
  const saltDeduction = Math.min(rawStateTax, saltCap);

  // 5. Taxable Income
  const taxableIncome = Math.max(0, grossPay - standardDeduction - saltDeduction - obbbaDeductions);

  // 6. Federal Tax (Brackets adjusted by inflation)
  const baseBrackets = FEDERAL_BRACKETS_2026[filingStatus];
  let federalTax = 0;
  let remainingTaxable = taxableIncome;
  let marginalRate = 0;

  for (let i = 0; i < baseBrackets.length; i++) {
    const current = baseBrackets[i];
    const next = baseBrackets[i + 1];
    
    const currentThreshold = current.threshold * inflationFactor;
    const nextThreshold = next ? next.threshold * inflationFactor : Infinity;
    const bracketSize = nextThreshold - currentThreshold;

    if (remainingTaxable > 0) {
      const taxableInBracket = Math.min(remainingTaxable, bracketSize);
      federalTax += taxableInBracket * current.rate;
      remainingTaxable -= taxableInBracket;
      marginalRate = current.rate;
    }
  }

  // 7. Credits (e.g. Child Tax Credit)
  const childCredit = extras.children * OBBBA_DATA.childCredit;
  federalTax = Math.max(0, federalTax - childCredit);

  // 8. FICA
  const ficaTax = Math.min(grossPay, SS_LIMIT) * FICA_RATE;

  const takeHomePay = grossPay - federalTax - rawStateTax - ficaTax;
  const totalTax = federalTax + rawStateTax + ficaTax;
  const effectiveTaxRate = grossPay > 0 ? totalTax / grossPay : 0;

  return {
    grossPay,
    federalTax,
    stateTax: rawStateTax,
    ficaTax,
    takeHomePay,
    effectiveTaxRate,
    marginalRate,
    standardDeduction,
    saltDeduction,
    obbbaDeduction: obbbaDeductions,
  };
}
