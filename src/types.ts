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
  preTaxDeductions: number;
  totalTax: number;
}

export interface JobMarketInsight {
  title: string;
  salary: number;
  link?: string;
  company?: string;
  increase?: number;
}

export type PayFrequency = 'weekly' | 'bi-weekly' | 'monthly' | 'annually';

export interface FormData {
  isHourly: boolean;
  salary: number;
  hourlyRate: number;
  hoursPerWeek: number;
  bonusPay: number;
  state: string;
  filingStatus: FilingStatus;
  year: TaxYear;
  occupation: string;
  overtimePay: number;
  tipIncome: number;
  children: number;
  autoLoanInterest: number;
  assumedInflation: number;
  contribution401k: number;
  contributionHSA: number;
  fsaContribution: number;
  healthPremiums: number;
  postTaxDeductions: number;
  propertyValue: number;
  propertyTaxRate: number;
  payFrequency: PayFrequency;
  relocationState: string;
}

export interface ComparisonData {
  enabled: boolean;
  jobB: FormData;
}

export interface COLData {
  state: string;
  index: number; // 100 is US average
  purchasingPowerMultiplier: number; // How much a dollar "feels" like
}
