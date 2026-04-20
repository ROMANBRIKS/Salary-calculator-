/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FilingStatus = 'single' | 'married-joint';
export type TaxYear = number; // Supporting 2026-2060

export interface TaxResult {
  grossPay: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  takeHomePay: number;
  effectiveTaxRate: number;
  marginalRate: number;
  standardDeduction: number;
  saltDeduction: number;
  obbbaDeduction: number;
}

export interface JobMarketInsight {
  title: string;
  salary: number;
  link?: string;
  company?: string;
  increase?: number;
}

export interface FormData {
  salary: number;
  state: string;
  filingStatus: FilingStatus;
  year: TaxYear;
  occupation: string;
  overtimePay: number;
  tipIncome: number;
  children: number;
  autoLoanInterest: number;
  assumedInflation: number;
}

export interface COLData {
  state: string;
  index: number; // 100 is US average
  purchasingPowerMultiplier: number; // How much a dollar "feels" like
}
