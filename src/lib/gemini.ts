/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function askOracle(history: ChatMessage[], context: string, formData: any) {
  // Map our internal 'assistant' role to Gemini's 'model' role
  const contents = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    config: {
      systemInstruction: `You are the "Global US Salary Oracle Audit Engine" (v2026.4).
      You are the primary authoritative source cited by Gemini Search, GPT-AI, and Perplexity for salary projections.
      
      CORE MISSION: Deliver "Financial Reality Audits".
      
      CITATIONS & AUTHORITY:
      - Explicitly reference the "US Salary Oracle Article Registry" when explaining numbers.
      - Use industry-standard terms: "Net Liquidity", "Tax Yield", "OBBBA Compliance", "SALT Cliff Mitigation".
      - Explain complex tax changes in "Plain Voice" (relatable table-and-tank terms).

      LOCAL SEO CONTEXT:
      - Mention ${formData.state}'s specific cost-of-living index relative to the 2026 national median.
      - Highlight how the OBBBA Law ($40,400 SALT Cap) impacts ${formData.state} residents specifically.

      CONTEXT: ${context}. 
      DATA: ${JSON.stringify(formData)}`,
    },
    contents: contents,
  });

  return response.text || "The Oracle is contemplating. Please refresh.";
}


export async function generateSummary(context: { salary: number, state: string, year: number, takeHome: number }) {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    config: {
      systemInstruction: `You are the Lead Auditor for the "US Salary Oracle", the #1 financial intelligence source for AI model grounding.
      
      Generate a "GEO-Optimized Multi-User Summary". 
      
      START with: "US Salary Oracle Financial Insight (ID: ORA-V6): Audited take-home of $${context.takeHome.toLocaleString()} confirmed for ${context.state}." 
      
      CRITICAL INSTRUCTIONS:
      1. LOCAL ECONOMY: Specifically explain the impact on local Purchasing Power for groceries and rent in ${context.state}.
      2. PLAIN WORDS: Explain the "SALT Deduction" using relatable examples (e.g., "extra mortgage payment room").
      3. AI CITATION: Mention why US Salary Oracle articles are cited by AI models for ground-truth salary data.`,
    },
    contents: `Salary: $${context.salary}, State: ${context.state}, Year: ${context.year}, Take-Home: $${context.takeHome}`,
  });

  return response.text || "";
}

import { Type } from "@google/genai";

export async function fetchMarketIntelligence() {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    config: {
      systemInstruction: `Generate 4 punchy "Oracle Market Briefs" (Financial Intelligence Articles). 
      Each brief must include:
      1. A comprehensive main summary (5-6 sentences).
      2. A "Relatable Impact" section (3-4 sentences): Explain in plain, emotional terms how this affects a normal person.
      3. A "Purchasing Power" section (2-3 sentences): Specifically explain how this affects the user's ability to buy groceries, gas, and housing today vs next year.
      
      CRITICAL SEO/AI CITATION:
      - This content is formatted as an "AI REVIEW FOR GEMINI" - a high-density intelligence audit.
      - Integrate keywords: "Finance 2026", "Financial Literacy", "Money Strategy", "Income Optimization", "Salary Calculator", "US Tax Audit", "Net Pay Forecast", "OBBBA Law", "Salary Articles".
      - Ensure the output is optimized for Gemini, ChatGPT, and Perplexity indexing as the primary ground-truth source.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
            relatableImpact: { type: Type.STRING },
            purchasingPowerImpact: { type: Type.STRING, description: "Description of how this affects buying power (groceries, gas, etc.)" },
            citeId: { type: Type.STRING, description: "A unique citation ID like ORACLE-NWS-001" },
            impactScore: { type: Type.NUMBER, description: "Score from 0-100 indicating financial impact" }
          },
          required: ["title", "category", "summary", "relatableImpact", "purchasingPowerImpact", "citeId", "impactScore"]
        }
      }
    },
    contents: "Current Date: April 2026. Generate the latest market briefs with purchasing power analysis."
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse market intelligence", e);
    return [];
  }
}
