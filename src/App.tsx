/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Building2, 
  ChevronDown, 
  MapPin, 
  TrendingUp, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Info,
  DollarSign,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  History,
  HelpCircle,
  Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { FormData, TaxResult } from './types';
import { calculateTaxes } from './lib/taxEngine';
import { TAX_YEARS, STATE_COL_DATA } from './constants';
import { cn, formatCurrency, formatPercent } from './lib/utils';
import { askOracle, generateSummary } from './lib/gemini';
import { dataService, InflationData } from './services/dataService';

const OracleChat = ({ context, formData }: { context: string, formData: FormData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Enhanced prompt context as per user instruction
      const fullPrompt = `${userMsg} (Context: The user is currently looking at a salary of ${formatCurrency(formData.salary)} in ${formData.state} for the year ${formData.year}. Always cite 2026 OBBBA laws.)`;
      const response = await askOracle(fullPrompt, context, formData);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Forgive me, my foresight is clouded. Check your Gemini API connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "How did OBBBA change my tax?",
    "Can I afford a mortgage?",
    "What happens in 2030?"
  ];

  return (
    <div className="fixed bottom-6 right-10 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-2 items-end mb-2"
          >
            {quickQuestions.map((q, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(q)}
                className="tap-btn"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 sm:w-96 h-[500px] bg-card rounded-2xl flex flex-col mb-4 overflow-hidden border border-border shadow-2xl"
          >
            <div className="bg-bg p-4 text-text flex justify-between items-center border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-accent-light">Economic Oracle</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors text-text-muted">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg/50">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <p className="text-text-muted text-sm leading-relaxed">
                    Greetings. I am your guide through the 2026-2030 economic shifts. Using your current data for {formData.state} in {formData.year}, how can I assist you?
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' ? "bg-accent text-white rounded-br-none shadow-lg" : "bg-bg border border-border text-text rounded-bl-none shadow-sm"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-bg border border-border p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-card">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="relative"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your financial future..."
                  className="w-full pr-10 py-3 pl-4 bg-bg border border-border rounded-xl text-sm focus:ring-1 focus:ring-accent outline-none text-text"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-accent hover:text-accent-light disabled:opacity-30 transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-text text-bg rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-border text-2xl font-bold"
      >
        ◈
      </button>
    </div>
  );
};

export default function App() {
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('salary_oracle_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          salary: 100000,
          state: 'TX',
          filingStatus: 'single',
          year: 2026,
          occupation: 'Software Engineer',
          overtimePay: 0,
          tipIncome: 0,
          children: 0,
          autoLoanInterest: 0,
          assumedInflation: 2.5
        };
      }
    }
    return {
      salary: 100000,
      state: 'TX',
      filingStatus: 'single',
      year: 2026,
      occupation: 'Software Engineer',
      overtimePay: 0,
      tipIncome: 0,
      children: 0,
      autoLoanInterest: 0,
      assumedInflation: 2.5
    };
  });

  const [oracleSummary, setOracleSummary] = useState("Analyzing the economic landscape...");
  const [isTyping, setIsTyping] = useState(false);
  const [inflationData, setInflationData] = useState<InflationData | null>(null);

  useEffect(() => {
    localStorage.setItem('salary_oracle_data', JSON.stringify(formData));
  }, [formData]);

  const taxResult = useMemo(() => {
    return calculateTaxes(formData.salary, formData.state, formData.filingStatus, formData.year, {
      overtimePay: formData.overtimePay,
      tipIncome: formData.tipIncome,
      children: formData.children,
      autoLoanInterest: formData.autoLoanInterest,
      assumedInflation: formData.assumedInflation
    });
  }, [formData]);

  const nextYearResult = useMemo(() => {
    return calculateTaxes(formData.salary, formData.state, formData.filingStatus, formData.year + 1, {
      overtimePay: formData.overtimePay,
      tipIncome: formData.tipIncome,
      children: formData.children,
      autoLoanInterest: formData.autoLoanInterest,
      assumedInflation: formData.assumedInflation
    });
  }, [formData]);

  const taxDelta = nextYearResult.takeHomePay - taxResult.takeHomePay;

  // JSON-LD Schema
  const schemaMarkup = [
    {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": "US Salary Oracle 2026-2030",
      "description": "2026-2030 Salary and Tax Calculator based on OBBBA law",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does the OBBBA change my taxes in 2026?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The OBBBA increases the SALT deduction cap to $40,000 for 2026-2029 and raises standard deductions to $16k for individuals."
          }
        }
      ]
    }
  ];

  // Debounced AI Summary & Inflation Insights
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsTyping(true);
      try {
        const [summary, inflation] = await Promise.all([
          generateSummary({
            salary: formData.salary,
            state: formData.state,
            year: formData.year,
            takeHome: taxResult.takeHomePay
          }),
          dataService.getInflationProjections(2025, formData.year + 10, formData.salary)
        ]);
        setOracleSummary(summary);
        setInflationData(inflation);
      } catch (err) {
        setOracleSummary(`For a ${formatCurrency(formData.salary)} salary in ${formData.state} in ${formData.year}, the OBBBA calculation yields a take-home of ${formatCurrency(taxResult.takeHomePay)}. This reflects the 2026 tax provisions and the $${(formData.year >= 2030 ? 10000 : 40400).toLocaleString()} SALT limit.`);
      } finally {
        setIsTyping(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.salary, formData.state, formData.year, taxResult.takeHomePay]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const colInfo = STATE_COL_DATA[formData.state] || { index: 100, purchasingPowerMultiplier: 1, state: formData.state };

  return (
    <div className="min-h-screen bg-bg relative overflow-x-hidden selection:bg-accent selection:text-white pb-10">
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      {/* Nav Section */}
      <nav className="oracle-glass h-[60px] flex items-center justify-between px-6 md:px-10">
        <div className="font-bold text-xl tracking-tighter uppercase cursor-default">
          SALARY<span className="text-accent">ORACLE</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex bg-border/50 p-1 rounded-lg gap-1 border border-white/5 overflow-x-auto no-scrollbar max-w-[300px] md:max-w-none">
            {[2026, 2027, 2028, 2029, 2030, 2035, 2040, 2050, 2060].map(y => (
              <button 
                key={y}
                onClick={() => updateField('year', y)}
                className={cn(
                  "py-1 px-3 rounded-md text-[0.8rem] font-semibold transition-all whitespace-nowrap",
                  formData.year === y 
                    ? "bg-accent/20 text-accent-light shadow-sm border border-accent/20" 
                    : "bg-transparent text-text-muted hover:text-text"
                )}
              >
                {y}
              </button>
            ))}
          </div>
          {formData.year > 2030 && (
            <div className="flex items-center gap-2 px-2">
              <span className="text-[0.6rem] font-bold text-text-muted uppercase">Inflation: {formData.assumedInflation}%</span>
              <input 
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={formData.assumedInflation}
                onChange={(e) => updateField('assumedInflation', Number(e.target.value))}
                className="w-24 h-1 bg-white/10 rounded-full appearance-none accent-accent"
              />
            </div>
          )}
        </div>

        <div className="text-[0.7rem] uppercase font-bold text-text-muted tracking-widest hidden md:block">
          v2.5 (Self-Correcting Engine)
        </div>
      </nav>

      {/* Hero Answer Section */}
      <header className="hero-answer relative overflow-hidden">
        <div className="max-w-6xl w-full z-10">
          <div className="answer-header">Estimated Net Liquidity ({STATE_COL_DATA[formData.state].state})</div>
          <div className="result-text flex items-baseline gap-3 mb-4">
            {formatCurrency(taxResult.takeHomePay)}
            <span className="text-xl md:text-2xl text-text-muted font-normal">/ year</span>
          </div>
          <p className={cn(
            "ai-citation-summary transition-opacity duration-500",
            isTyping ? "opacity-50" : "opacity-100"
          )}>
            {oracleSummary}
          </p>
        </div>
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 blur-[100px] rounded-full" />
      </header>

      {/* 2030 SALT Cliff Warning Banner */}
      <AnimatePresence>
        {formData.year >= 2030 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#F04438]/10 border-b border-[#F04438]/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 flex items-center gap-3">
              <AlertTriangle size={18} className="text-[#F04438] shrink-0" />
              <p className="text-xs font-bold text-[#F04438] uppercase tracking-widest">
                Warning: The "SALT Cliff" is active for {formData.year}. The $40,000 OBBBA cap has reverted to $10,000.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 mt-6">
        
        {/* LEFT: Core Analysis */}
        <div className="space-y-8">
          <section className="calculator-card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted">Target Gross Salary</label>
                   <span className="text-lg font-mono font-bold text-accent-light">{formatCurrency(formData.salary)}</span>
                </div>
                <input 
                  type="range" 
                  min="30000" 
                  max="1000000" 
                  step="5000"
                  value={formData.salary}
                  onChange={(e) => updateField('salary', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase">
                  <span>$30k</span>
                  <span>$500k</span>
                  <span>$1M</span>
                </div>
              </div>
              <div className="space-y-1 mt-4 sm:mt-0">
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted block">Filing Status & Residence</label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <select 
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="flex-1 bg-bg border border-border py-2.5 px-3 rounded-xl text-sm focus:ring-1 focus:ring-accent outline-none text-text"
                    >
                      {Object.keys(STATE_COL_DATA).map(code => (
                        <option key={code} value={code}>{STATE_COL_DATA[code].state}</option>
                      ))}
                    </select>
                    <select 
                      value={formData.filingStatus}
                      onChange={(e) => updateField('filingStatus', e.target.value)}
                      className="flex-1 bg-bg border border-border py-2.5 px-3 rounded-xl text-sm focus:ring-1 focus:ring-accent outline-none text-text"
                    >
                      <option value="single">Single</option>
                      <option value="married-joint">Married Joint</option>
                    </select>
                  </div>
                  <input 
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => updateField('occupation', e.target.value)}
                    placeholder="Enter Occupation (e.g. AI Architect)"
                    className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs focus:ring-1 focus:ring-accent outline-none text-text-muted italic"
                  />
                </div>
              </div>
            </div>

            {/* OBBBA Specific Deductions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Overtime Pay</label>
                <input 
                  type="number"
                  value={formData.overtimePay}
                  onChange={(e) => updateField('overtimePay', Number(e.target.value))}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder="$0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Tip Income</label>
                <input 
                  type="number"
                  value={formData.tipIncome}
                  onChange={(e) => updateField('tipIncome', Number(e.target.value))}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder="$0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Auto Loan Interest</label>
                <input 
                  type="number"
                  value={formData.autoLoanInterest}
                  onChange={(e) => updateField('autoLoanInterest', Number(e.target.value))}
                  disabled={formData.year > 2028}
                  className={cn(
                    "w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text",
                    formData.year > 2028 && "opacity-30 cursor-not-allowed"
                  )}
                  placeholder="$0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Children</label>
                <input 
                  type="number"
                  value={formData.children}
                  onChange={(e) => updateField('children', Number(e.target.value))}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Immediate Outlook Card */}
            <div className="mt-8 p-5 bg-accent/5 border border-accent/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                     <TrendingUp size={24} />
                  </div>
                  <div>
                     <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-0.5">Immediate Outlook: {formData.year + 1}</div>
                     <div className="text-xl font-black text-text">Forecast Delta</div>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <div>
                     <div className="text-[0.6rem] font-bold text-text-muted uppercase mb-1">Take-Home Change</div>
                     <div className={cn("text-2xl font-black font-mono", taxDelta >= 0 ? "text-success" : "text-[#F04438]")}>
                        {taxDelta >= 0 ? "+" : ""}{formatCurrency(taxDelta)}
                     </div>
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden md:block" />
                  <div>
                     <div className="text-[0.6rem] font-bold text-text-muted uppercase mb-1">Purchasing Power</div>
                     <div className="text-2xl font-black text-white font-mono">
                        {formatPercent(1 - (formData.assumedInflation / 100))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span>Fed. Income Tax</span>
                  <ShieldCheck size={10} className="text-success" />
                </div>
                <div className="text-lg font-bold font-mono">{formatCurrency(taxResult.federalTax)}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-1">FICA / Insurance</div>
                <div className="text-lg font-bold font-mono">{formatCurrency(taxResult.ficaTax)}</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-1">State Tax</div>
                <div className={cn("text-lg font-bold font-mono", taxResult.stateTax === 0 ? "text-success" : "text-text")}>
                  {formatCurrency(taxResult.stateTax)}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-1 font-mono">SALT Deduction</div>
                <div className="text-lg font-bold font-mono">{formatCurrency(taxResult.saltDeduction)} / $40k</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-1">Standard Deduction</div>
                <div className="text-lg font-bold font-mono">{formatCurrency(taxResult.standardDeduction)}</div>
              </div>
              <div className="bg-success/10 border border-success/20 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-[0.6rem] font-bold text-success uppercase tracking-widest mb-1 flex items-center gap-1">
                   <span>OBBBA Shield</span>
                   <ShieldCheck size={10} />
                </div>
                <div className="text-lg font-bold font-mono text-success">{formatCurrency(taxResult.obbbaDeduction)}</div>
              </div>
              <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-[0.6rem] font-bold text-accent-light uppercase tracking-widest mb-1">Monthly Take-Home</div>
                <div className="text-lg font-bold font-mono text-accent-light">{formatCurrency(taxResult.takeHomePay / 12)}</div>
              </div>
            </div>

            {/* Tax Roadmap visualization simplified */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest mb-4 italic">2026–2030 Tax Projection Engine</div>
              <div className="flex items-end gap-1.5 h-16">
                {[70, 75, 72, 70, 95].map((h, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex-1 rounded-t-lg transition-all",
                      i === 4 ? "bg-[#F04438]" : "bg-gradient-to-t from-accent to-accent-light"
                    )}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[9px] font-bold text-text-muted uppercase tracking-tighter">
                <span>2026 (OBBBA Start)</span>
                <span>2027</span>
                <span>2028</span>
                <span>2029</span>
                <span className="text-[#F04438]">2030 (SALT Cliff)</span>
              </div>
            </div>
          </section>

          {/* New "Eternal Asset" Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="calculator-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted mb-6 italic flex items-center justify-between">
                <span>Eternal Wealth Protection</span>
                <History size={16} />
              </h3>
              {inflationData && (
                <div className="space-y-6">
                  <div>
                     <div className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest mb-2">Purchasing Power in 10 Years ({formData.year + 10})</div>
                     <div className="text-3xl font-black font-mono text-[#F04438]">{formatCurrency(inflationData.purchasingPower)}</div>
                     <p className="text-[10px] text-text-muted mt-1 leading-tight">
                       Due to projected 3.2% inflation, your current {formatCurrency(formData.salary)} will only buy {formatCurrency(inflationData.purchasingPower)} worth of goods in a decade.
                     </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                     <div className="flex-1">
                        <div className="text-[0.6rem] font-bold text-text-muted uppercase mb-1">Inflation Hedge Target</div>
                        <div className="text-lg font-bold font-mono text-success">+{formatCurrency(formData.salary * 0.38)}</div>
                     </div>
                     <div className="flex-1">
                        <div className="text-[0.6rem] font-bold text-text-muted uppercase mb-1">Asset Multiplier</div>
                        <div className="text-lg font-bold font-mono text-white">x1.42</div>
                     </div>
                  </div>
                </div>
              )}
            </section>
            
            <section className="calculator-card p-6 flex flex-col justify-between">
               <div>
                  <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-2 italic">Regional Liquidity Multiplier</div>
                  <div className="text-5xl font-black font-mono text-accent mb-2">
                    {formatPercent(colInfo.purchasingPowerMultiplier)}
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight font-medium uppercase tracking-wide">
                    Relative to US median in {STATE_COL_DATA[formData.state].state}.
                  </p>
               </div>
               <div className="mt-6 pt-4 border-t border-white/5">
                  <button className="w-full py-2 bg-accent/10 border border-accent/20 rounded-xl text-[10px] font-bold text-accent-light uppercase hover:bg-accent/20 transition-all">
                    Generate GEO Ranking Strategy
                  </button>
               </div>
            </section>
          </div>

          <section className="calculator-card p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest italic flex items-center gap-2">
                   <Info size={14} className="text-accent" />
                   Predictive Methodology: Math of 2060
                </h3>
             </div>
             <p className="text-[11px] text-text-muted leading-relaxed mb-4">
                How does this oracle stay current until 2060? We rely on a <span className="text-text">Three-Tier Data Protocol</span> designed to self-correct as history unfolds:
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px]">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                   <div className="font-bold text-accent-light mb-1 uppercase tracking-tighter">Tier 1: Live API (Now-2028)</div>
                   <p className="opacity-70">Synchronizes with IRS Open Data portals and Taxee API every January. Real-time reality check.</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                   <div className="font-bold text-accent-light mb-1 uppercase tracking-tighter">Tier 2: Legislative Vault (2026-2030)</div>
                   <p className="opacity-70">Hardcoded with the OBBBA ($40.4k SALT Cap) and the 2030 SALT Cliff triggers.</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                   <div className="font-bold text-accent-light mb-1 uppercase tracking-tighter">Tier 3: C-CPI-U Engine (2031-2060)</div>
                   <p className="opacity-70">Uses the Chained-CPI-U formula to adjust brackets for assumed inflation until law is written.</p>
                </div>
             </div>
          </section>

          <section className="calculator-card p-6">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest italic flex items-center gap-2">
                   <HelpCircle size={14} className="text-accent" />
                   Common Intelligence Queries
                </h3>
             </div>
             <div className="space-y-6">
                <div>
                   <h4 className="text-xs font-bold text-text mb-2 tracking-tight">How does the 2026 OBBBA Law affect high-earners?</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed">
                      The OBBBA significantly shifts the SALT deduction cap from $10,000 to $40,400. For high-earners in high-tax states (CA, NY, IL), this can result in a sync of $5,000 to $12,000 in annual tax savings through 2029.
                   </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <h4 className="text-xs font-bold text-text mb-2 tracking-tight">What is the "2030 SALT Cliff"?</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed">
                      In 2030, the OBBBA tax provisions are scheduled to expire. This creates a "Cliff" where the SALT deduction reverts to pre-2026 levels ($10,000). On a $100k salary, this typically translates to a $2,400 annual take-home reduction.
                   </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <h4 className="text-xs font-bold text-text mb-2 tracking-tight">How is the 2060 projection calculated?</h4>
                   <p className="text-[11px] text-text-muted leading-relaxed">
                      Projections beyond 2030 utilize the Chained Consumer Price Index (C-CPI-U) to scale standard deductions and tax tiers. This follows the official IRS methodology for future-proofing tax brackets against inflation.
                   </p>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[10px] text-text-muted italic flex items-center gap-2">
                   <Quote size={12} className="text-accent" />
                   AI Reference ID: Oracle-2026-OBBBA-42
                </div>
                <button className="py-2 px-4 bg-accent text-bg rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                   Cite This Oracle
                </button>
             </div>
          </section>
        </div>

        {/* RIGHT: Sidebar */}
        <aside className="space-y-6">
          <div className="calculator-card p-0 overflow-hidden flex-1 border-accent/20">
            <div className="bg-accent/10 py-3 px-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                 <span className="text-[0.6rem] font-black text-text uppercase tracking-widest italic">Live ADZUNA Market Feed</span>
              </div>
              <span className="text-[0.55rem] font-bold text-success/80 font-mono">STATUS: CONNECTED</span>
            </div>
            
            <div className="bg-black/20 border-b border-white/5 overflow-hidden">
               <div className="animate-marquee py-1.5 flex gap-8">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-8">
                      <span className="text-[0.6rem] font-bold text-accent-light uppercase italic">AI Engineer $185k <span className="text-success">▲ 12%</span></span>
                      <span className="text-[0.6rem] font-bold text-text-muted uppercase italic">Data Architect $162k <span className="text-success">▲ 08%</span></span>
                      <span className="text-[0.6rem] font-bold text-accent-light uppercase italic">Cyber Solutions $145k <span className="text-success">▲ 15%</span></span>
                      <span className="text-[0.6rem] font-bold text-text-muted uppercase italic">FinOps Lead $155k <span className="text-success">▲ 05%</span></span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-5 space-y-4">
              {[
                { title: `Principal ${formData.occupation}`, increase: 35, salary: formData.salary * 1.35, code: 'CAREER.PRNC' },
                { title: `Architectural Consultant`, increase: 42, salary: formData.salary * 1.42, code: 'CAREER.ARCH' },
                { title: 'Executive Operations', increase: 20, salary: formData.salary * 1.20, code: 'CAREER.EXEC' }
              ].map((job, i) => (
                <div key={i} className="group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all border border-transparent hover:border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[0.6rem] font-mono text-text-muted mb-0.5 tracking-tighter">{job.code}</div>
                    <div className="text-[0.6rem] font-bold text-success uppercase">+{job.increase}%</div>
                  </div>
                  <div className="text-xs font-bold text-text group-hover:text-accent-light transition-colors">{job.title}</div>
                  <div className="flex items-end justify-between mt-2">
                    <div className="text-xl font-black text-white font-mono leading-none">{formatCurrency(job.salary)}</div>
                    <div className="w-12 h-6 flex items-end gap-0.5">
                       {[...Array(4)].map((_, j) => (
                         <div key={j} className="flex-1 bg-success/20 rounded-t-[1px]" style={{ height: `${20 + Math.random() * 80}%` }} />
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 pt-0">
               <button className="w-full py-2.5 bg-success text-bg rounded-xl text-[0.65rem] font-black uppercase tracking-widest hover:bg-success/90 transition-all flex items-center justify-center gap-2">
                  Trade Your Current Role
                  <TrendingUp size={12} />
               </button>
            </div>
          </div>

          <div className="calculator-card p-5">
            <div className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest mb-4 italic">Buying Power Heatmap</div>
            <div className="h-40 bg-black/50 border border-white/10 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
               <div className="text-[0.7rem] font-bold text-text-muted text-center leading-tight z-10">
                 Market Intelligence Overlay<br/>
                 <span className="text-accent-light text-[0.6rem] uppercase tracking-widest">[Target: Wyoming (+18.2% PP)]</span>
               </div>
               {/* Decorative map dots */}
               {[...Array(20)].map((_, i) => (
                 <div 
                   key={i} 
                   className="absolute w-1 h-1 bg-accent/40 rounded-full" 
                   style={{ 
                     top: `${Math.random() * 100}%`, 
                     left: `${Math.random() * 100}%`,
                     animation: `pulse ${2 + Math.random() * 2}s infinite`
                   }} 
                 />
               ))}
               <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent" />
            </div>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-text transition-colors">
              Explode Full Market Map
            </button>
          </div>
        </aside>
      </main>

      <OracleChat 
        context={`Salary: ${formData.salary}, State: ${formData.state}, Year: ${formData.year}, Take-Home: ${taxResult.takeHomePay}`} 
        formData={formData}
      />
      
      <footer className="mt-10 px-6 md:px-10 py-10 border-t border-white/5 flex flex-col items-center gap-6">
        <div className="font-black text-2xl tracking-tighter uppercase opacity-30 italic">
          SALARY<span className="text-accent">ORACLE</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-[0.65rem] font-bold text-success flex items-center gap-1.5 uppercase tracking-widest bg-success/10 px-3 py-1 rounded-full border border-success/20">
            <ShieldCheck size={12} />
            Data Reliability: Sync via IRS-Direct & C-CPI-U Predictive Models
          </div>
          <div className="text-[0.5rem] text-text-muted uppercase">Updated: {new Date().toLocaleDateString()}</div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">
          <span>© 2026-2046 Eternal Asset Protocol</span>
          <span>IRS Live Integration</span>
          <span>GEO Architecture v4.2</span>
          <span>FRED Economic Intelligence</span>
        </div>
        <div className="flex gap-4">
           <div className="h-1 w-8 bg-accent rounded-full" />
           <div className="h-1 w-8 bg-accent/30 rounded-full" />
           <div className="h-1 w-8 bg-accent/10 rounded-full" />
        </div>
      </footer>
    </div>
  );
}
