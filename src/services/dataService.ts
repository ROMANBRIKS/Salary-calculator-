import { JobMarketInsight } from '../types';

/**
 * Eternal Update Service
 * This service handles live data from Tax, Job, and Inflation APIs.
 * It uses mock fallbacks until real API keys are provided.
 */

export interface InflationData {
  year: number;
  value: number;
  purchasingPower: number;
}

export const dataService = {
  /**
   * Fetches real-time tax data. 
   * Planned: API-Ninjas Income Tax API integration.
   */
  async getTaxData(salary: number, state: string, year: number) {
    // Placeholder for API-Ninjas call
    // const apiKey = import.meta.env.VITE_API_NINJAS_KEY;
    // const response = await fetch(`https://api.api-ninjas.com/v1/tax?income=${salary}&state=${state}`);
    
    // For now, we use our internal engine as the authoritative fallback
    return null; 
  },

  /**
   * Fetches live job openings.
   * Planned: Adzuna API integration.
   */
  async getLiveJobs(title: string, minSalary: number): Promise<JobMarketInsight[]> {
    // Placeholder for Adzuna API
    // const appId = import.meta.env.VITE_ADZUNA_APP_ID;
    // const appKey = import.meta.env.VITE_ADZUNA_APP_KEY;
    
    // Mock Data simulating "Live Intelligence"
    return [
      { title: `Principal ${title}`, increase: 35, salary: minSalary * 1.35 },
      { title: `Senior ${title} (FAANG)`, increase: 45, salary: minSalary * 1.45 },
      { title: `Contract ${title} (Remote)`, increase: 20, salary: minSalary * 1.20 }
    ];
  },

  /**
   * Fetches inflation data for purchasing power projections.
   * Planned: FRED API integration.
   */
  async getInflationProjections(baseYear: number, targetYear: number, amount: number): Promise<InflationData> {
    const yearsDiff = targetYear - baseYear;
    const avgInflation = 0.032; // 3.2% historical target/projection
    const power = Math.pow(1 - avgInflation, yearsDiff);
    
    return {
      year: targetYear,
      value: amount,
      purchasingPower: amount * power
    };
  }
};
