/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilingStatus, TaxResult, TaxYear } from '../types';
import { OBBBA_DATA, FEDERAL_BRACKETS_2026, FICA_RATE, SS_LIMIT, STATE_TAX_RATES } from '../constants';

export function calculateTaxes(
  inputGross: number,
  state: string,
  filingStatus: FilingStatus,
  year: TaxYear,
  extras: { 
    isHourly: boolean,
    hourlyRate: number,
    hoursPerWeek: number,
    bonusPay: number,
    overtimePay: number, 
    tipIncome: number, 
    children: number, 
    autoLoanInterest: number,
    assumedInflation: number,
    contribution401k: number,
    contributionHSA: number,
    fsaContribution: number,
    healthPremiums: number,
    postTaxDeductions: number
  }
): TaxResult {
  // 0. Gross Calculation
  const baseSalary = extras.isHourly ? (extras.hourlyRate * extras.hoursPerWeek * 52) : inputGross;
  const totalGross = baseSalary + extras.bonusPay + extras.overtimePay + extras.tipIncome;

  // 1. Pre-tax Deductions
  const preTaxDeductions = extras.contribution401k + extras.contributionHSA + extras.fsaContribution + extras.healthPremiums;
  const taxableGross = Math.max(0, totalGross - preTaxDeductions);

  // 2. Inflation Factor
  let inflationFactor = 1;
  if (year > 2030) {
    const yearsProjected = year - 2026;
    inflationFactor = Math.pow(1 + (extras.assumedInflation / 100), yearsProjected);
  }

  // 3. OBBBA Adjustments
  const standardDeduction = OBBBA_DATA.standardDeduction[filingStatus] * inflationFactor;
  const saltCap = (year >= 2026 && year < 2030) ? OBBBA_DATA.saltCap['2026-2029'] : OBBBA_DATA.saltCap['2030'];

  let obbbaDeductions = 0;
  if (year >= 2026 && year <= 2030) {
    obbbaDeductions += Math.min(extras.overtimePay, OBBBA_DATA.overtimeShield[filingStatus]);
    obbbaDeductions += Math.min(extras.tipIncome, OBBBA_DATA.tipShield);
    if (year <= 2028) {
      obbbaDeductions += Math.min(extras.autoLoanInterest, OBBBA_DATA.autoLoanDeduction);
    }
  }

  // 4. State & Local Taxes
  const stateTaxRate = STATE_TAX_RATES[state] || 0.05;
  let rawStateTax = taxableGross * stateTaxRate;
  
  // Local Tax precision (Example: NYC has local tax)
  if (state === 'NY') {
    rawStateTax += taxableGross * 0.038; // NYC Local Tax approx
  }

  const saltDeduction = Math.min(rawStateTax, saltCap);

  // 5. Federal Tax (Suppemental Bonus Tax Logic)
  // Bonus is often taxed at flat 22% supplemental rate for federal
  const bonusFedTax = extras.bonusPay * 0.22;
  const regularTaxableIncome = Math.max(0, (taxableGross - extras.bonusPay) - standardDeduction - saltDeduction - obbbaDeductions);

  const baseBrackets = FEDERAL_BRACKETS_2026[filingStatus];
  let federalTax = 0;
  let remainingTaxable = regularTaxableIncome;
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

  federalTax += bonusFedTax;

  // 6. Credits
  const childCredit = extras.children * OBBBA_DATA.childCredit;
  federalTax = Math.max(0, federalTax - childCredit);

  // 7. FICA
  const ficaTax = Math.min(taxableGross, SS_LIMIT) * FICA_RATE;

  // 8. Result Assembly
  const totalTax = federalTax + rawStateTax + ficaTax;
  const takeHomePay = Math.max(0, taxableGross - federalTax - rawStateTax - ficaTax - extras.postTaxDeductions);
  const effectiveTaxRate = totalGross > 0 ? totalTax / totalGross : 0;

  return {
    grossPay: totalGross,
    federalTax,
    stateTax: rawStateTax,
    ficaTax,
    takeHomePay,
    effectiveTaxRate,
    marginalRate,
    standardDeduction,
    saltDeduction,
    obbbaDeduction: obbbaDeductions,
    preTaxDeductions,
    totalTax
  };
}
