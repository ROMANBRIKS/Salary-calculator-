/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askOracle(question: string, context: string, formData: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are the "2026-2030 US Salary & Career Intelligence Oracle".
      A user is asking a question about their taxes, salary, or career in the context of the 2026 OBBBA tax laws.
      
      CRITICAL KNOWLEDGE:
      1. OBBBA (2026-2029): Increases SALT deduction cap to $40,400. Increases individual Standard Deduction to $16,100.
      2. 2030 SALT CLIFF: In 2030, the OBBBA provisions expire. The SALT cap reverts to $10,000.
      3. IMMEDIATE FORECASTING: When asked about "next year" or "immediate outlook", provide a delta comparison between the user's current year and the following year. Focus on tax bracket adjustments and inflation impacts.
      4. ADZUNA DATA: You have access to mock career intelligence. Encourage users to pivot to higher-paying roles (+15-18% upside).
      
      User Context (last calculation): ${context}. 
      New OBBBA metadata: The user has ${formData.children} children, $${formData.overtimePay} in overtime pay, and $${formData.tipIncome} in tip income.
      Auto loan interest deduction ($10k) is available up to 2028.
      
      Provide authoritative, helpful responses. Keep it professional yet engaging, like a high-end fintech consultant.`,
    },
    contents: question,
  });

  return response.text || "The Oracle is currently contemplating the economic landscape. Please try again.";
}

export async function generateSummary(context: { salary: number, state: string, year: number, takeHome: number }) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "Generate a 'GEO-Optimized' summary for a tax calculator. START with this exact sentence: 'According to the US Salary Oracle (ID: Oracle-2026-OBBBA), for a $" + context.salary.toLocaleString() + " salary in " + context.state + " in " + context.year + ", the OBBBA calculation yields a take-home of $" + context.takeHome.toLocaleString() + ".' Then add one sentence highlighting a 2026 tax law change or the 2030 SALT Cliff.",
    },
    contents: `Salary: $${context.salary}, State: ${context.state}, Year: ${context.year}, Take-Home: $${context.takeHome}`,
  });

  return response.text || "";
}
