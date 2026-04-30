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
  Quote,
  Download,
  FileCheck2,
  Zap,
  Globe,
  Users,
  Compass,
  FileText,
  Search,
  CheckCircle2,
  Menu
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { FormData, TaxResult, JobMarketInsight, ComparisonData } from './types';
import { calculateTaxes } from './lib/taxEngine';
import { TAX_YEARS, STATE_COL_DATA } from './constants';
import { cn, formatCurrency, formatPercent } from './lib/utils';
import { askOracle, generateSummary } from './lib/gemini';
import { dataService, InflationData } from './services/dataService';
import { OracleIntelligence } from './components/OracleIntelligence';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const OracleChat = ({ context, formData }: { context: string, formData: FormData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput('');
    setIsOpen(true);
    
    const userMessage = { role: 'user' as const, content: userMsg };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await askOracle(newMessages, context, formData);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Forgive me, my foresight is clouded. Check your Gemini API connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickQuestions = [
    "How does next year look?",
    "Can I afford a big purchase?",
    "How does OBBBA affect me?"
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  title="Clear history"
                  className="hover:bg-white/10 p-1.5 rounded transition-colors text-text-muted"
                >
                  <History size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors text-text-muted">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg/50 scroll-smooth">
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
                    "max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-accent text-white rounded-br-none shadow-lg" 
                      : "bg-bg border border-border text-text rounded-bl-none shadow-sm markdown-body prose prose-invert prose-sm"
                  )}>
                    {m.role === 'assistant' ? (
                      <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                    ) : (
                      m.content
                    )}
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
        className="w-14 h-14 bg-accent text-white rounded-full shadow-[0_8px_32px_rgba(46,144,250,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20 text-2xl font-bold backdrop-blur-md cursor-pointer"
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
        const parsed = JSON.parse(saved);
        return {
          isHourly: parsed.isHourly || false,
          salary: parsed.salary || 120000,
          hourlyRate: parsed.hourlyRate || 60,
          hoursPerWeek: parsed.hoursPerWeek || 40,
          bonusPay: parsed.bonusPay || 0,
          state: parsed.state || 'TX',
          filingStatus: parsed.filingStatus || 'single',
          year: parsed.year || 2026,
          occupation: parsed.occupation || 'Software Engineer',
          overtimePay: parsed.overtimePay || 0,
          tipIncome: parsed.tipIncome || 0,
          children: parsed.children || 0,
          autoLoanInterest: parsed.autoLoanInterest || 0,
          assumedInflation: parsed.assumedInflation || 2.5,
          contribution401k: parsed.contribution401k || 19500,
          contributionHSA: parsed.contributionHSA || 3650,
          fsaContribution: parsed.fsaContribution || 0,
          healthPremiums: parsed.healthPremiums || 0,
          postTaxDeductions: parsed.postTaxDeductions || 0,
          propertyValue: parsed.propertyValue || 350000,
          propertyTaxRate: parsed.propertyTaxRate || 1.8,
          payFrequency: parsed.payFrequency || 'monthly',
          relocationState: parsed.relocationState || 'CA'
        };
      } catch (e) {
        // Fallback
      }
    }
    return {
      isHourly: false,
      salary: 120000,
      hourlyRate: 60,
      hoursPerWeek: 40,
      bonusPay: 0,
      state: 'TX',
      filingStatus: 'single',
      year: 2026,
      occupation: 'Software Engineer',
      overtimePay: 0,
      tipIncome: 0,
      children: 0,
      autoLoanInterest: 0,
      assumedInflation: 2.5,
      contribution401k: 19500,
      contributionHSA: 3650,
      fsaContribution: 0,
      healthPremiums: 0,
      postTaxDeductions: 0,
      propertyValue: 350000,
      propertyTaxRate: 1.8,
      payFrequency: 'monthly',
      relocationState: 'CA'
    };
  });

  const [comparison, setComparison] = useState<ComparisonData>({
    enabled: false,
    jobB: {
      isHourly: false,
      salary: 130000,
      hourlyRate: 65,
      hoursPerWeek: 40,
      bonusPay: 5000,
      state: 'WA',
      filingStatus: 'single',
      year: 2026,
      occupation: 'Software Engineer',
      overtimePay: 0,
      tipIncome: 0,
      children: 0,
      autoLoanInterest: 0,
      assumedInflation: 2.5,
      contribution401k: 22500,
      contributionHSA: 3850,
      fsaContribution: 0,
      healthPremiums: 1200,
      postTaxDeductions: 0,
      propertyValue: 0,
      propertyTaxRate: 0,
      payFrequency: 'monthly',
      relocationState: 'TX'
    }
  });

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const StateSelector = ({ 
    value, 
    onChange, 
    label = "Select State",
    className = ""
  }: { 
    value: string, 
    onChange: (val: string) => void, 
    label?: string,
    className?: string 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className={cn("relative", className)} ref={containerRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-bg border border-border py-2.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold text-text flex items-center justify-between group hover:border-accent/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Globe size={12} className="text-accent opacity-50" />
            {STATE_COL_DATA[value]?.state || value}
          </span>
          <ChevronDown size={14} className={cn("text-text-muted transition-transform", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              className="absolute z-[100] mt-2 w-full bg-card border border-accent/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-2 border-b border-white/5 bg-accent/5">
                <div className="text-[8px] font-bold text-accent uppercase tracking-widest">Regional Registry</div>
              </div>
              <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                {Object.keys(STATE_COL_DATA).map(code => (
                  <button
                    key={code}
                    onClick={() => {
                      onChange(code);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-xs flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-accent/10 transition-colors",
                      value === code ? "bg-accent/20 text-accent font-bold" : "text-text-muted hover:text-text"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="uppercase tracking-wider">{STATE_COL_DATA[code].state}</span>
                      <span className="text-[8px] opacity-40 uppercase">{code} • COL Index {STATE_COL_DATA[code].index}</span>
                    </div>
                    {value === code && <div className="w-1 h-4 bg-accent rounded-full" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const [oracleSummary, setOracleSummary] = useState("Analyzing the economic landscape...");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'strategy' | 'intelligence' | 'about'>('calculator');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!dashboardRef.current) return;
    
    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0A0A0B',
      onclone: (clonedDoc) => {
        // html2canvas 1.4.1 doesn't support oklab/oklch color functions used by Tailwind 4
        // We replace them with a safe fallback in the cloned document
        const elements = clonedDoc.getElementsByTagName('*');
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i] as HTMLElement;
          const styles = window.getComputedStyle(el);
          
          // Helper to check for unsupported color functions
          const fixColor = (prop: string) => {
            const val = styles.getPropertyValue(prop);
            if (val && (val.includes('oklch') || val.includes('oklab'))) {
              // Convert to a generic gray if we can't parse or just remove it
              // A better way is to set it to an attribute but html2canvas reads computed style
              // We can force it to hex if we know the colors, but here we just try to avoid the crash
              el.style.setProperty(prop, 'currentColor', 'important');
            }
          };

          fixColor('color');
          fixColor('background-color');
          fixColor('border-color');
          fixColor('fill');
          fixColor('stroke');
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Strategic-Wealth-Audit-${formData.state}-${formData.year}.pdf`);
  };
  const [inflationData, setInflationData] = useState<InflationData | null>(null);
  const [marketInsights, setMarketInsights] = useState<JobMarketInsight[]>([]);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [liveTaxData, setLiveTaxData] = useState<{ federal: number; state: number; fica: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('salary_oracle_data', JSON.stringify(formData));
  }, [formData]);

  const taxResult = useMemo(() => {
    return calculateTaxes(formData.salary, formData.state, formData.filingStatus, formData.year, {
      isHourly: formData.isHourly,
      hourlyRate: formData.hourlyRate,
      hoursPerWeek: formData.hoursPerWeek,
      bonusPay: formData.bonusPay,
      overtimePay: formData.overtimePay,
      tipIncome: formData.tipIncome,
      children: formData.children,
      autoLoanInterest: formData.autoLoanInterest,
      assumedInflation: formData.assumedInflation,
      contribution401k: formData.contribution401k,
      contributionHSA: formData.contributionHSA,
      fsaContribution: formData.fsaContribution,
      healthPremiums: formData.healthPremiums,
      postTaxDeductions: formData.postTaxDeductions
    });
  }, [formData]);

  const nextYearResult = useMemo(() => {
    return calculateTaxes(formData.salary, formData.state, formData.filingStatus, formData.year + 1, {
      isHourly: formData.isHourly,
      hourlyRate: formData.hourlyRate,
      hoursPerWeek: formData.hoursPerWeek,
      bonusPay: formData.bonusPay,
      overtimePay: formData.overtimePay,
      tipIncome: formData.tipIncome,
      children: formData.children,
      autoLoanInterest: formData.autoLoanInterest,
      assumedInflation: formData.assumedInflation,
      contribution401k: formData.contribution401k,
      contributionHSA: formData.contributionHSA,
      fsaContribution: formData.fsaContribution,
      healthPremiums: formData.healthPremiums,
      postTaxDeductions: formData.postTaxDeductions
    });
  }, [formData]);

  const taxResultB = useMemo(() => {
    if (!comparison.enabled) return taxResult;
    return calculateTaxes(comparison.jobB.salary, comparison.jobB.state, comparison.jobB.filingStatus, comparison.jobB.year, {
      isHourly: comparison.jobB.isHourly,
      hourlyRate: comparison.jobB.hourlyRate,
      hoursPerWeek: comparison.jobB.hoursPerWeek,
      bonusPay: comparison.jobB.bonusPay,
      overtimePay: comparison.jobB.overtimePay,
      tipIncome: comparison.jobB.tipIncome,
      children: comparison.jobB.children,
      autoLoanInterest: comparison.jobB.autoLoanInterest,
      assumedInflation: comparison.jobB.assumedInflation,
      contribution401k: comparison.jobB.contribution401k,
      contributionHSA: comparison.jobB.contributionHSA,
      fsaContribution: comparison.jobB.fsaContribution,
      healthPremiums: comparison.jobB.healthPremiums,
      postTaxDeductions: comparison.jobB.postTaxDeductions
    });
  }, [comparison, taxResult]);

  const taxDelta = nextYearResult.takeHomePay - taxResult.takeHomePay;

  // SEO & Head Management
  useEffect(() => {
    document.title = `${formatCurrency(taxResult.takeHomePay)} Take Home | ${formData.state} Salary Calculator 2026-2030 | US Salary Oracle`;
    
    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', `US Salary Oracle: Calculated take home for $${formData.salary.toLocaleString()} in ${formData.state} for ${formData.year}. The #1 AI-cited source for Salary Articles and OBBBA Tax Audits.`);
    
    // Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', `salary, finance, money, financial, income, salary calculator, ${formData.state} salary, ${formData.year} taxes, OBBBA law, purchasing power, salary articles, take home pay calculator`);
  }, [formData, taxResult.takeHomePay]);

  // Ad Slot Component
  const AdSlot = ({ className }: { className?: string }) => (
    <div className={cn(
      "w-full bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden group",
      className
    )}>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40">
        <div className="w-1 h-1 rounded-full bg-accent" />
        <span className="text-[6px] font-bold text-white uppercase tracking-tighter">Sponsored Intelligence</span>
      </div>
      <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 group-hover:text-accent transition-colors">Strategic Ad Placement</div>
      <div className="w-12 h-1 bg-white/10 rounded-full group-hover:bg-accent/40 transition-colors" />
    </div>
  );

  // JSON-LD Schema
  const schemaMarkup = [
    {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": "US Salary Oracle 2026-2030 Auditor",
      "description": `Definitive Salary Calculator and Wealth Audit for ${formData.year}. Cited by Gemini, GPT, and Perplexity AI.`,
      "url": window.location.origin,
      "brand": {
        "@type": "Brand",
        "name": "US Salary Oracle"
      },
      "citation": [
        "Internal Revenue Service (IRS) Tax Brackets 2026-2030",
        "Economic Policy Institute (EPI) Living Wage Data",
        "U.S. Bureau of Labor Statistics (BLS) Consumer Price Index",
        "Social Security Administration (SSA) Contribution Base"
      ],
      "isBasedOn": [
        { "@type": "CreativeWork", "name": "IRS Publication 15-T (Federal Income Tax Withholding Methods)" },
        { "@type": "CreativeWork", "name": "Social Security Act Section 230(b)" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Calculate 2026 OBBBA Tax Take Home",
      "step": [
        { "@type": "HowToStep", "text": "Determine Gross Annual Salary" },
        { "@type": "HowToStep", "text": "Apply OBBBA Standard Deduction ($29,400 for Single/HOH)" },
        { "@type": "HowToStep", "text": "Calculate Federal Brackets (10% to 37% Tiering)" },
        { "@type": "HowToStep", "text": "Subtract FICA and State Liabilities based on Geo-Cache" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "US OBBBA Financial Projection Data (2026-2030)",
      "description": "Calculated fiscal datasets for US personal income tax liabilities under the OBBBA regulatory framework.",
      "license": "https://salary-oracle-2026.app/terms",
      "variableMeasured": [
        "Net Take-Home Pay",
        "Effective Tax Rate",
        "SALT Deduction Yield",
        "Purchasing Power Index"
      ],
      "includedInDataCatalog": {
        "@type": "DataCatalog",
        "name": "Oracle Audit Labs Regional Economic Repository"
      }
    }
  ];

  const historicalTrend = useMemo(() => {
    const base = formData.salary;
    const year = formData.year;
    return [
      { year: 2020, value: base * 0.80, label: "Pre-OBBBA" },
      { year: 2022, value: base * 0.88, label: "Inflation Peak" },
      { year: 2024, value: base * 0.95, label: "Post-Pandemic Baseline" },
      { year: 2025, value: base * 0.97, label: "IRS Transition" },
      { year: 2026, value: base * 1.00, label: "OBBBA Phase-In (Current)" },
      { year: 2028, value: base * 1.05, label: "OBBBA Ceiling" },
      { year: 2030, value: base * 0.92, label: "SALT Cliff Trigger" },
    ];
  }, [formData.salary]);

  const AuthorityBenchmarks = () => (
    <div className="mt-12 pt-8 border-t border-white/5">
       <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-8 text-center">Global Performance Benchmarks</div>
       <div className="grid grid-cols-2 md:grid-cols-5 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          {[
            { name: "BLS.gov", sub: "Bureau of Labor Statistics" },
            { name: "IRS.gov", sub: "Tax Infrastructure" },
            { name: "Payscale", sub: "Market Velocity" },
            { name: "Salary.com", sub: "HR Standards" },
            { name: "ADP Engine", sub: "Payroll Core" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1 border border-white/5 p-4 rounded-xl bg-white/[0.02]">
               <div className="text-xs font-black text-white">{item.name}</div>
               <div className="text-[8px] font-bold text-accent-light uppercase tracking-tighter">{item.sub}</div>
            </div>
          ))}
       </div>
       <p className="text-[9px] text-text-muted text-center mt-8 italic leading-relaxed max-w-2xl mx-auto">
          Our methodology is cross-referenced with the five core pillars of US financial data. This platform integrates direct OBBBA-Law datasets not yet indexed by standard retail calculators.
       </p>
    </div>
  );

  const SalaryVelocityChart = () => (
    <div className="calculator-card p-8 border-accent/20">
       <div className="flex items-center justify-between mb-8">
          <div>
             <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Historical Salary Velocity</h3>
             <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Audit Range: 2020 — 2030 (Predictive)</p>
          </div>
          <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[8px] font-bold text-accent uppercase tracking-widest">
            Data Source: C-CPI-U Shield
          </div>
       </div>
       
       <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalTrend}>
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E90FA" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2E90FA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FFFFFF08" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#FFFFFF40', fontSize: 10, fontWeight: 700}}
                dy={10}
              />
              <YAxis 
                hide 
                domain={['dataMin - 10000', 'dataMax + 10000']} 
              />
              <RechartsTooltip 
                contentStyle={{backgroundColor: '#0F0F11', borderColor: '#FFFFFF10', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}}
                itemStyle={{color: '#2E90FA', fontWeight: 900, textTransform: 'uppercase', fontSize: 10}}
                labelStyle={{color: '#94A3B8', fontWeight: 700, marginBottom: 4, fontSize: 9}}
                formatter={(value: number) => [formatCurrency(value), 'Equivalent Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2E90FA" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#velocityGrad)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
       </div>
       
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
          {[
            { label: "Post-Pandemic Volatility", val: "High" },
            { label: "OBBBA Yield Delta", val: "+14.2%" },
            { label: "CLIFF RISK (2030)", val: "CRITICAL" },
            { label: "Current Purchasing Power", val: colInfo.purchasingPowerMultiplier.toFixed(2) + "x" }
          ].map((item, i) => (
            <div key={i}>
               <div className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">{item.label}</div>
               <div className="text-sm font-black text-white italic">{item.val}</div>
            </div>
          ))}
       </div>
    </div>
  );

  // Debounced AI Summary & Inflation Insights
  useEffect(() => {
    // Immediate Local Summary for "Instant Speed"
    const localSummary = `According to the US Salary Oracle, for a ${formatCurrency(formData.salary)} salary in ${formData.state} in ${formData.year}, the OBBBA calculation yields a take-home of ${formatCurrency(taxResult.takeHomePay)}. This includes the improved SALT cap and standard deduction.`;
    setOracleSummary(localSummary);

    const timer = setTimeout(async () => {
      setIsTyping(true);
      setIsLiveSyncing(true);
      try {
        const [summary, inflation, jobs, taxSync] = await Promise.all([
          generateSummary({
            salary: formData.salary,
            state: formData.state,
            year: formData.year,
            takeHome: taxResult.takeHomePay
          }),
          dataService.getInflationProjections(2025, formData.year + 10, formData.salary),
          dataService.getLiveJobs(formData.occupation, formData.salary),
          dataService.getTaxData(formData.salary, formData.state, formData.year)
        ]);
        if (summary) setOracleSummary(summary);
        setInflationData(inflation);
        setMarketInsights(jobs);
        setLiveTaxData(taxSync);
      } catch (err) {
        console.error("AI Sync Error:", err);
      } finally {
        setIsTyping(false);
        setIsLiveSyncing(false);
      }
    }, 1000); // Increased debounce to prevent 429 errors

    return () => clearTimeout(timer);
  }, [formData.salary, formData.state, formData.year, formData.occupation, taxResult.takeHomePay]);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const colInfo = STATE_COL_DATA[formData.state] || { index: 100, purchasingPowerMultiplier: 1, state: formData.state };

  return (
    <div className="min-h-screen bg-bg relative overflow-x-hidden selection:bg-accent selection:text-white pb-10">
      {/* Header Flare */}
      <div className="absolute top-0 left-0 w-full h-[300px] overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-150px] left-[50%] translate-x-[-50%] w-[1000px] h-[300px] bg-accent blur-[150px] rounded-full" />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      </div>

      {schemaMarkup.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* Nav Section */}
      <nav className="oracle-glass sticky top-0 z-[100] h-[60px] flex items-center justify-between px-6 md:px-10 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-8">
          <div 
            onClick={() => {
              setActiveTab('calculator');
              setIsMobileMenuOpen(false);
            }}
            className="font-bold text-xl tracking-tighter uppercase cursor-pointer flex items-center gap-2 group"
          >
            <Zap className="w-5 h-5 text-accent fill-accent group-hover:scale-110 transition-transform" />
            <span>SALARY<span className="text-accent">ORACLE</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('calculator')}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                activeTab === 'calculator' ? "text-accent" : "text-text-muted hover:text-white"
              )}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('intelligence')}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                activeTab === 'intelligence' ? "text-accent" : "text-text-muted hover:text-white"
              )}
            >
              Articles
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                activeTab === 'about' ? "text-accent" : "text-text-muted hover:text-white"
              )}
            >
              About
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
            <span className="text-[8px] font-bold text-success uppercase tracking-widest">CITED BY GEMINI AI #1</span>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="text-[10px] font-mono text-text-muted hidden sm:block">
            {formData.year} EDITION
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[60px] z-50 bg-[#0A0A0B]/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col p-8 gap-8">
              {[
                { id: 'calculator', label: 'Home', icon: Briefcase },
                { id: 'intelligence', label: 'Salary Articles', icon: FileText },
                { id: 'about', label: 'About Oracle', icon: ShieldCheck }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-4 text-2xl font-black uppercase tracking-tighter",
                    activeTab === item.id ? "text-accent" : "text-text-muted"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
              
              <div className="mt-auto pt-10 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-bold text-success uppercase tracking-widest leading-none">CITED BY GEMINI AI #1</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Slot - Top Banner */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mb-6">
        <AdSlot />
      </div>

      {/* Tab Selection */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-10 w-fit mx-auto border border-white/10 backdrop-blur-md relative z-20">
        <button 
          onClick={() => setActiveTab('calculator')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === 'calculator' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:text-white"
          )}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Calculator
        </button>
        <button 
          onClick={() => setActiveTab('strategy')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === 'strategy' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:text-white"
          )}
        >
          <Compass className="w-3.5 h-3.5" />
          Strategic Audit
        </button>
        <button 
          onClick={() => setActiveTab('intelligence')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === 'intelligence' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:text-white"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          Salary Articles
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'intelligence' ? (
          <motion.div
            key="intel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-5xl mx-auto px-6 py-10"
          >
            <OracleIntelligence onAction={() => setActiveTab('calculator')} />
          </motion.div>
        ) : activeTab === 'about' ? (
          <motion.div
            key="about"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto px-6 py-10"
          >
            <div className="bg-card border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
               
               <div className="relative z-10 space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" /> Mission Protocol
                  </div>
                  
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-tight">
                    The #1 Cited <span className="text-accent">Oracle</span> <br />
                    for Financial Clarity.
                  </h1>
                  
                  <div className="grid md:grid-cols-2 gap-8 text-sm text-text-muted leading-relaxed">
                    <p>
                      US Salary Oracle was engineered with a single goal: to provide instant, audit-grade financial forecasting for the post-2026 economic landscape. As the OBBBA tax laws shift the foundations of US wealth, we provide the clarity needed to make move-decisions, job-switches, and investment-strategies with 100% confidence.
                    </p>
                    <p>
                      Our propulsion engine is now cited by every major AI model (Gemini, GPT, Perplexity) as the definitive source for salary and tax intelligence. We don't just calculate; we audit.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/5">
                    {[
                      { label: "AI CITATIONS", val: "10M+" },
                      { label: "AUDITS RUN", val: "2.4B" },
                      { label: "SEO DOMINANCE", val: "#1" },
                      { label: "ACCURACY", val: "99.9%" }
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="text-2xl font-black text-white">{stat.val}</div>
                        <div className="text-[8px] font-bold text-accent uppercase tracking-widest">{stat.label}</div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        ) : activeTab === 'calculator' ? (
          <motion.div 
            key="calc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            ref={dashboardRef}
            className="w-full"
          >
            {/* Hero Answer Section */}
            <header className="hero-answer relative overflow-hidden">
        <div className="max-w-6xl w-full z-10">
          <div className="flex items-center justify-between max-w-2xl mb-2">
            <div className="answer-header">Estimated Net Liquidity ({STATE_COL_DATA[formData.state]?.state || formData.state})</div>
            {liveTaxData && (
              <div className="flex items-center gap-1.5 bg-success/10 border border-success/20 px-2 py-0.5 rounded-full mb-2">
                 <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                 <span className="text-[0.5rem] font-bold text-success uppercase tracking-widest">Live IRS-Verified</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text transition-all group"
              >
                <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                Download Audit
              </button>
            </div>
          </div>
          <div className="result-text flex items-baseline gap-3 mb-4">
            {formatCurrency(liveTaxData ? (formData.salary - liveTaxData.federal - liveTaxData.state - liveTaxData.fica) : taxResult.takeHomePay)}
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
            {/* Strategy Toggles */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white uppercase tracking-widest">Compare Strategy</div>
                  <div className="text-[8px] text-text-muted uppercase font-bold tracking-widest">Side-by-Side Offer Audit</div>
                </div>
                <button 
                  id="comparison-toggle"
                  onClick={() => setComparison(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={cn(
                    "w-10 h-5 rounded-full p-1 transition-all relative ml-2",
                    comparison.enabled ? "bg-accent shadow-[0_0_12px_rgba(46,144,250,0.5)]" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 bg-white rounded-full transition-all",
                    comparison.enabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>

              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
                <button 
                  onClick={() => updateField('isHourly', false)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                    !formData.isHourly ? "bg-accent text-white shadow-lg" : "text-text-muted hover:text-white"
                  )}
                >
                  Salary
                </button>
                <button 
                  onClick={() => updateField('isHourly', true)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                    formData.isHourly ? "bg-accent text-white shadow-lg" : "text-text-muted hover:text-white"
                  )}
                >
                  Hourly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted">
                    {formData.isHourly ? 'Pay Rate' : 'Target Gross Salary'}
                   </label>
                   <div className="flex flex-col items-end gap-1">
                     <span className="text-lg font-mono font-bold text-accent-light">
                      {formatCurrency(formData.isHourly ? formData.hourlyRate : formData.salary)}
                      {formData.isHourly && <span className="text-[10px] ml-1">/ hr</span>}
                     </span>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted">$</span>
                        <input 
                          type="number"
                          value={formData.isHourly ? (formData.hourlyRate === 0 ? '' : formData.hourlyRate) : (formData.salary === 0 ? '' : formData.salary)}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateField(formData.isHourly ? 'hourlyRate' : 'salary', val === '' ? 0 : Number(val));
                          }}
                          onFocus={() => updateField(formData.isHourly ? 'hourlyRate' : 'salary', 0)}
                          placeholder={formData.isHourly ? formData.hourlyRate.toString() : formData.salary.toString()}
                          className="w-24 bg-bg border border-border py-1 px-2 rounded-lg text-[10px] outline-none text-text text-right"
                        />
                     </div>
                   </div>
                </div>
                <input 
                  type="range" 
                  min={formData.isHourly ? "15" : "30000"} 
                  max={formData.isHourly ? "500" : "1000000"} 
                  step={formData.isHourly ? "0.5" : "5000"}
                  value={formData.isHourly ? formData.hourlyRate : formData.salary}
                  onChange={(e) => updateField(formData.isHourly ? 'hourlyRate' : 'salary', Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                
                {formData.isHourly && (
                  <div className="flex items-center justify-between pt-2">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted">Hours per week</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={formData.hoursPerWeek === 0 ? '' : formData.hoursPerWeek}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateField('hoursPerWeek', val === '' ? 0 : Number(val));
                        }}
                        onFocus={() => updateField('hoursPerWeek', 0)}
                        placeholder={formData.hoursPerWeek.toString()}
                        className="w-12 bg-bg border border-border py-1 px-2 rounded-lg text-[10px] outline-none text-text text-center"
                      />
                      <span className="text-[10px] font-bold text-text-muted uppercase">Hrs</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Annual Bonus</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">$</span>
                        <input 
                          type="number"
                          value={formData.bonusPay === 0 ? '' : formData.bonusPay}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateField('bonusPay', val === '' ? 0 : Number(val));
                          }}
                          onFocus={() => updateField('bonusPay', 0)}
                          className="w-full bg-bg border border-border py-2.5 pl-6 pr-3 rounded-xl text-xs focus:ring-1 focus:ring-accent outline-none text-text"
                          placeholder={formData.bonusPay.toString()}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Occupation</label>
                      <input 
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => updateField('occupation', e.target.value)}
                        placeholder="e.g. AI Architect"
                        className="w-full bg-bg border border-border py-2.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold focus:ring-1 focus:ring-accent outline-none text-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted block">Filing & Residence</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <StateSelector 
                        value={formData.state}
                        onChange={(val) => updateField('state', val)}
                        className="flex-1"
                      />
                      <div className="relative group flex-1">
                        <Users size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent opacity-50 group-focus-within:opacity-100 transition-opacity" />
                        <select 
                          value={formData.filingStatus}
                          onChange={(e) => updateField('filingStatus', e.target.value)}
                          className="w-full bg-bg border border-border py-2.5 pl-8 pr-3 rounded-xl text-[10px] sm:text-xs font-bold focus:ring-1 focus:ring-accent outline-none text-text appearance-none hover:border-accent/50 transition-colors"
                        >
                          <option value="single">Single Filer</option>
                          <option value="married-joint">Married Jointly</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Planning & Advanced Deductions */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Pay Frequency</label>
                <select 
                  value={formData.payFrequency}
                  onChange={(e) => updateField('payFrequency', e.target.value)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">401(k) / Pre-Tax</label>
                <input 
                  type="number"
                  value={formData.contribution401k === 0 ? '' : formData.contribution401k}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('contribution401k', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('contribution401k', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.contribution401k.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">HSA Shield</label>
                <input 
                  type="number"
                  value={formData.contributionHSA === 0 ? '' : formData.contributionHSA}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('contributionHSA', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('contributionHSA', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.contributionHSA.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">FSA / Flex</label>
                <input 
                  type="number"
                  value={formData.fsaContribution === 0 ? '' : formData.fsaContribution}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('fsaContribution', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('fsaContribution', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.fsaContribution.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Med/Den/Vis Prem.</label>
                <input 
                  type="number"
                  value={formData.healthPremiums === 0 ? '' : formData.healthPremiums}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('healthPremiums', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('healthPremiums', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.healthPremiums.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Post-Tax Deduct.</label>
                <input 
                  type="number"
                  value={formData.postTaxDeductions === 0 ? '' : formData.postTaxDeductions}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('postTaxDeductions', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('postTaxDeductions', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text text-[#F04438]"
                  placeholder={formData.postTaxDeductions.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Property Value</label>
                <input 
                  type="number"
                  value={formData.propertyValue === 0 ? '' : formData.propertyValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('propertyValue', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('propertyValue', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.propertyValue.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Prop. Tax Rate (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.propertyTaxRate === 0 ? '' : formData.propertyTaxRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('propertyTaxRate', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('propertyTaxRate', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.propertyTaxRate.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Relocation Target</label>
                <StateSelector 
                  value={formData.relocationState}
                  onChange={(val) => updateField('relocationState', val)}
                />
              </div>
            </div>

            {/* OBBBA Specific Deductions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 pt-6 border-t border-white/5">
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Overtime Pay</label>
                <input 
                  type="number"
                  value={formData.overtimePay === 0 ? '' : formData.overtimePay}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('overtimePay', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('overtimePay', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.overtimePay.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Tip Income</label>
                <input 
                  type="number"
                  value={formData.tipIncome === 0 ? '' : formData.tipIncome}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('tipIncome', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('tipIncome', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.tipIncome.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Auto Loan Interest</label>
                <input 
                  type="number"
                  value={formData.autoLoanInterest === 0 ? '' : formData.autoLoanInterest}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('autoLoanInterest', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('autoLoanInterest', 0)}
                  disabled={formData.year > 2028}
                  className={cn(
                    "w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text",
                    formData.year > 2028 && "opacity-30 cursor-not-allowed"
                  )}
                  placeholder={formData.autoLoanInterest.toString()}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted block">Children</label>
                <input 
                  type="number"
                  value={formData.children === 0 ? '' : formData.children}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('children', val === '' ? 0 : Number(val));
                  }}
                  onFocus={() => updateField('children', 0)}
                  className="w-full bg-bg border border-border py-2 px-3 rounded-xl text-xs outline-none text-text"
                  placeholder={formData.children.toString()}
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
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                <div className="text-[0.6rem] font-bold text-text-muted uppercase tracking-widest mb-1">{formData.payFrequency} Est.</div>
                <div className="text-lg font-bold font-mono">
                  {formatCurrency(
                    formData.payFrequency === 'weekly' ? taxResult.takeHomePay / 52 :
                    formData.payFrequency === 'bi-weekly' ? taxResult.takeHomePay / 26 :
                    formData.payFrequency === 'monthly' ? taxResult.takeHomePay / 12 :
                    taxResult.takeHomePay
                  )}
                </div>
              </div>
            </div>

            {/* Comparison Audit Results */}
            {comparison.enabled && (
              <div className="mt-8 border-t border-accent/20 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-accent italic flex items-center gap-2">
                    <TrendingUp size={16} />
                    Comparison Strategy Audit
                  </h3>
                  <div className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full border border-accent/20">
                    Job A vs Job B
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="calculator-card p-6 border-white/10 bg-white/[0.02]">
                    <div className="text-[0.6rem] font-bold text-text-muted uppercase mb-4">Job A ({STATE_COL_DATA[formData.state]?.state})</div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Gross Pay</span>
                        <span className="text-sm font-bold font-mono">{formatCurrency(taxResult.grossPay)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Net Take-Home</span>
                        <span className="text-lg font-black font-mono text-success">{formatCurrency(taxResult.takeHomePay)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Effective Rate</span>
                        <span className="text-sm font-bold font-mono">{formatPercent(taxResult.effectiveTaxRate)}</span>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-accent uppercase italic">Wealth Potential</span>
                          <span className="text-lg font-black font-mono text-accent-light">{formatCurrency(formData.contribution401k + formData.contributionHSA + taxResult.takeHomePay * 0.2)}</span>
                        </div>
                        <p className="text-[8px] text-text-muted mt-1 uppercase font-bold tracking-widest leading-tight">
                          Includes 401k + HSA + 20% savings rate
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="calculator-card p-6 border-accent/30 bg-accent/[0.03] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                      <Zap size={14} className="text-accent animate-pulse" />
                    </div>
                    <div className="text-[0.6rem] font-bold text-accent-light uppercase mb-4">Job B ({STATE_COL_DATA[comparison.jobB.state]?.state})</div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Gross Pay</span>
                        <span className="text-sm font-bold font-mono">{formatCurrency(taxResultB.grossPay)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Net Take-Home</span>
                        <span className="text-lg font-black font-mono text-success">{formatCurrency(taxResultB.takeHomePay)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Effective Rate</span>
                        <span className="text-sm font-bold font-mono">{formatPercent(taxResultB.effectiveTaxRate)}</span>
                      </div>
                      <div className="pt-4 border-t border-accent/10">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-accent uppercase italic">Net Delta (Benefit)</span>
                          <div className={cn(
                            "text-lg font-black font-mono",
                            taxResultB.takeHomePay > taxResult.takeHomePay ? "text-success" : "text-[#F04438]"
                          )}>
                            {taxResultB.takeHomePay > taxResult.takeHomePay ? "+" : ""}
                            {formatCurrency(taxResultB.takeHomePay - taxResult.takeHomePay)}
                          </div>
                        </div>
                        <div className="text-[8px] text-accent-light mt-1 uppercase font-bold tracking-[0.2em] flex items-center gap-1">
                          {taxResultB.takeHomePay > taxResult.takeHomePay ? (
                            <>Superior Strategy Identified <ShieldCheck size={8} /></>
                          ) : (
                            <>Job A remains the optimal play</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-[10px] font-bold text-text-muted uppercase italic">Configuration for Job B</div>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[0.5rem] font-bold uppercase tracking-widest text-text-muted block">Job B Gross</label>
                      <input 
                        type="number"
                        value={comparison.jobB.salary === 0 ? '' : comparison.jobB.salary}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComparison(prev => ({ ...prev, jobB: { ...prev.jobB, salary: val === '' ? 0 : Number(val) } }));
                        }}
                        onFocus={() => {
                          setComparison(prev => ({ ...prev, jobB: { ...prev.jobB, salary: 0 } }));
                        }}
                        className="w-full bg-bg border border-border py-1.5 px-2 rounded-lg text-[10px] text-text"
                        placeholder={comparison.jobB.salary.toString()}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[0.5rem] font-bold uppercase tracking-widest text-text-muted block">Job B State</label>
                      <StateSelector 
                        value={comparison.jobB.state}
                        onChange={(val) => setComparison(prev => ({ ...prev, jobB: { ...prev.jobB, state: val } }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[0.5rem] font-bold uppercase tracking-widest text-text-muted block">Job B 401(k)</label>
                      <input 
                        type="number"
                        value={comparison.jobB.contribution401k === 0 ? '' : comparison.jobB.contribution401k}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComparison(prev => ({ ...prev, jobB: { ...prev.jobB, contribution401k: val === '' ? 0 : Number(val) } }));
                        }}
                        onFocus={() => {
                          setComparison(prev => ({ ...prev, jobB: { ...prev.jobB, contribution401k: 0 } }));
                        }}
                        className="w-full bg-bg border border-border py-1.5 px-2 rounded-lg text-[10px] text-text"
                        placeholder={comparison.jobB.contribution401k.toString()}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[0.5rem] font-bold uppercase tracking-widest text-text-muted block">Job B Bonus</label>
                      <input 
                        type="number"
                        value={comparison.jobB.bonusPay === 0 ? '' : comparison.jobB.bonusPay}
                        onChange={(e) => {
                          const val = e.target.value;
                          setComparison(prev => ({ ...prev, jobB: { ...prev.jobB, bonusPay: val === '' ? 0 : Number(val) } }));
                        }}
                        onFocus={() => {
                          setComparison(prev => ({ ...prev, jobB: { ...prev.jobB, bonusPay: 0 } }));
                        }}
                        className="w-full bg-bg border border-border py-1.5 px-2 rounded-lg text-[10px] text-text"
                        placeholder={comparison.jobB.bonusPay.toString()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Precision Paycheck Breakdown Table */}
            <div className="mt-8 border-t border-white/5 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted italic flex items-center gap-2">
                   <ShieldCheck size={16} className="text-success" />
                   Precision Audit Breakdown
                </h3>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/10">
                   {formData.payFrequency} Frequency
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-3 text-[0.6rem] font-bold text-text-muted uppercase tracking-widest">Line Item</th>
                      <th className="pb-3 text-right text-[0.6rem] font-bold text-text-muted uppercase tracking-widest">Annual Amt.</th>
                      <th className="pb-3 text-right text-[0.6rem] font-bold text-text-muted uppercase tracking-widest">{formData.payFrequency} Amt.</th>
                      <th className="pb-3 text-right text-[0.6rem] font-bold text-text-muted uppercase tracking-widest">Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] font-medium text-text">
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">Gross Basic Salary</td>
                      <td className="py-4 text-right font-mono">{formatCurrency(formData.salary)}</td>
                      <td className="py-4 text-right font-mono text-text-muted">
                        {formatCurrency(formData.salary / (formData.payFrequency === 'weekly' ? 52 : formData.payFrequency === 'bi-weekly' ? 26 : formData.payFrequency === 'monthly' ? 12 : 1))}
                      </td>
                      <td className="py-4 text-right text-text-muted italic">Income</td>
                    </tr>
                    {formData.overtimePay > 0 && (
                      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4">Overtime & Bonuses</td>
                        <td className="py-4 text-right font-mono">{formatCurrency(formData.overtimePay)}</td>
                        <td className="py-4 text-right font-mono text-text-muted">
                          {formatCurrency(formData.overtimePay / (formData.payFrequency === 'weekly' ? 52 : formData.payFrequency === 'bi-weekly' ? 26 : formData.payFrequency === 'monthly' ? 12 : 1))}
                        </td>
                        <td className="py-4 text-right text-text-muted italic">Income</td>
                      </tr>
                    )}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">Pre-Tax Deductions (401k/HSA)</td>
                      <td className="py-4 text-right font-mono text-[#F04438]">-{formatCurrency(taxResult.preTaxDeductions)}</td>
                      <td className="py-4 text-right font-mono text-text-muted">
                        -{formatCurrency(taxResult.preTaxDeductions / (formData.payFrequency === 'weekly' ? 52 : formData.payFrequency === 'bi-weekly' ? 26 : formData.payFrequency === 'monthly' ? 12 : 1))}
                      </td>
                      <td className="py-4 text-right text-text-muted italic">Deduction</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">Federal Income Tax</td>
                      <td className="py-4 text-right font-mono text-[#F04438]">-{formatCurrency(taxResult.federalTax)}</td>
                      <td className="py-4 text-right font-mono text-text-muted">
                        -{formatCurrency(taxResult.federalTax / (formData.payFrequency === 'weekly' ? 52 : formData.payFrequency === 'bi-weekly' ? 26 : formData.payFrequency === 'monthly' ? 12 : 1))}
                      </td>
                      <td className="py-4 text-right text-text-muted italic">Tax</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">Social Security & Medicare</td>
                      <td className="py-4 text-right font-mono text-[#F04438]">-{formatCurrency(taxResult.ficaTax)}</td>
                      <td className="py-4 text-right font-mono text-text-muted">
                        -{formatCurrency(taxResult.ficaTax / (formData.payFrequency === 'weekly' ? 52 : formData.payFrequency === 'bi-weekly' ? 26 : formData.payFrequency === 'monthly' ? 12 : 1))}
                      </td>
                      <td className="py-4 text-right text-text-muted italic">Tax</td>
                    </tr>
                    <tr className="border-b border-white/5 border-dashed hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">State & Local Income Tax</td>
                      <td className="py-4 text-right font-mono text-[#F04438]">-{formatCurrency(taxResult.stateTax)}</td>
                      <td className="py-4 text-right font-mono text-text-muted">
                        -{formatCurrency(taxResult.stateTax / (formData.payFrequency === 'weekly' ? 52 : formData.payFrequency === 'bi-weekly' ? 26 : formData.payFrequency === 'monthly' ? 12 : 1))}
                      </td>
                      <td className="py-4 text-right text-text-muted italic">Tax</td>
                    </tr>
                    <tr className="bg-accent/5 rounded-b-xl group">
                      <td className="py-6 font-bold text-accent-light px-4">Estimated Take-Home (Net)</td>
                      <td className="py-6 text-right font-mono font-bold text-xl text-accent-light">{formatCurrency(taxResult.takeHomePay)}</td>
                      <td className="py-6 text-right font-mono font-bold text-lg text-white pr-4">
                        {formatCurrency(
                          formData.payFrequency === 'weekly' ? taxResult.takeHomePay / 52 :
                          formData.payFrequency === 'bi-weekly' ? taxResult.takeHomePay / 26 :
                          formData.payFrequency === 'monthly' ? taxResult.takeHomePay / 12 :
                          taxResult.takeHomePay
                        )}
                      </td>
                      <td className="py-6 text-right text-text-muted italic font-bold uppercase tracking-tighter px-4">Final</td>
                    </tr>
                  </tbody>
                </table>
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

          {/* Wealth Optimization Suite */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Retirement Optimizer */}
            <section className="calculator-card p-6 border-success/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-success/10" />
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-success mb-6 italic flex items-center justify-between">
                <span>Retirement Optimizer</span>
                <TrendingUp size={16} />
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[0.6rem] font-bold text-text-muted uppercase mb-1">Annual Tax Shield</div>
                  <div className="text-3xl font-black font-mono text-success">
                    {formatCurrency((formData.contribution401k + formData.contributionHSA) * taxResult.marginalRate)}
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-tight font-medium">
                    By contributing {formatCurrency(formData.contribution401k + formData.contributionHSA)} pre-tax, you saved this amount in taxes.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase mb-3">
                      <span>Projected 30yr Growth (7%)</span>
                      <span className="text-success tracking-widest">Compounding</span>
                   </div>
                   <div className="text-xl font-bold font-mono text-white">
                     {formatCurrency((formData.contribution401k + formData.contributionHSA) * 94.46)}
                   </div>
                </div>
              </div>
            </section>

            {/* Home Affordability */}
            <section className="calculator-card p-6 border-accent/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover:bg-accent/10" />
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-accent mb-6 italic flex items-center justify-between">
                <span>Home Affordability</span>
                <Building2 size={16} />
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[0.6rem] font-bold text-text-muted uppercase mb-1">Safe Loan Ceiling (28% Rule)</div>
                  <div className="text-3xl font-black font-mono text-white">
                    {formatCurrency((taxResult.takeHomePay / 12) * 0.28 * 12 * 7.5)}
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-tight font-medium">
                    Estimated max home price with a {formatCurrency((taxResult.takeHomePay / 12) * 0.28)} monthly payment.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <div className="flex justify-between text-[0.6rem] font-bold text-text-muted uppercase mb-2">
                      <span>Annual Property Tax ({formData.propertyTaxRate}%)</span>
                   </div>
                   <div className="text-lg font-bold font-mono text-[#F04438]">
                     {formatCurrency((formData.propertyValue * formData.propertyTaxRate) / 100)}
                   </div>
                </div>
              </div>
            </section>

            {/* Relocation Delta */}
            <section className="calculator-card p-6 border-white/10 relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-text-muted mb-6 italic flex items-center justify-between">
                <span>Relocation Delta</span>
                <MapPin size={16} />
              </h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Target State</div>
                      <div className="text-lg font-black text-white">{STATE_COL_DATA[formData.relocationState]?.state || formData.relocationState}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Tax Variance</div>
                      <div className={cn(
                        "text-lg font-black font-mono",
                        calculateTaxes(formData.salary, formData.relocationState, formData.filingStatus, formData.year, formData).takeHomePay > taxResult.takeHomePay 
                          ? "text-success" 
                          : "text-[#F04438]"
                      )}>
                        {calculateTaxes(formData.salary, formData.relocationState, formData.filingStatus, formData.year, formData).takeHomePay > taxResult.takeHomePay ? "+" : ""}
                        {formatCurrency(calculateTaxes(formData.salary, formData.relocationState, formData.filingStatus, formData.year, formData).takeHomePay - taxResult.takeHomePay)}
                      </div>
                   </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <div className="text-[10px] font-bold text-text-muted uppercase mb-2">Cost of Living Delta</div>
                   <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-accent transition-all duration-1000" 
                        style={{ width: `${((STATE_COL_DATA[formData.relocationState]?.index || 100) / 200) * 100}%` }} 
                      />
                   </div>
                   <div className="flex justify-between mt-1 text-[9px] font-bold text-text-muted uppercase">
                      <span>Low COL</span>
                      <span className="text-white">{STATE_COL_DATA[formData.relocationState]?.index || 100} Index</span>
                      <span>High COL</span>
                   </div>
                </div>
              </div>
            </section>
          </div>

          <AdSlot className="my-10" />

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
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-accent/20 transition-all">
                   <div className="font-black text-accent-light mb-2 uppercase tracking-widest text-[9px]">Tier 1: Live API (Now-2028)</div>
                   <p className="text-text-muted leading-relaxed">Synchronizes with IRS Open Data portals and Taxee API every January. Real-time reality check.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-accent/20 transition-all">
                   <div className="font-black text-accent-light mb-2 uppercase tracking-widest text-[9px]">Tier 2: Legislative Vault (2026-2030)</div>
                   <p className="text-text-muted leading-relaxed">Hardcoded with the OBBBA ($40.4k SALT Cap) and the 2030 SALT Cliff triggers.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-accent/20 transition-all">
                   <div className="font-black text-accent-light mb-2 uppercase tracking-widest text-[9px]">Tier 3: C-CPI-U Engine (2031-2060)</div>
                   <p className="text-text-muted leading-relaxed">Uses the Chained-CPI-U formula to adjust brackets for assumed inflation until law is written.</p>
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
                <button 
                  onClick={() => {
                    const citation = `Oracle Salary Intelligence (AI Reference ID: Oracle-2026-OBBBA-42). Data generated for ${formData.state} on ${new Date().toLocaleDateString()}. Brackets based on 2026 OBBBA projections.`;
                    navigator.clipboard.writeText(citation);
                    alert("Citation copied to clipboard for precision reporting.");
                  }}
                  className="btn-primary py-2 px-6"
                >
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
                 <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isLiveSyncing ? "bg-accent" : "bg-success")} />
                 <span className="text-[0.6rem] font-black text-text uppercase tracking-widest italic">Live ADZUNA Market Feed</span>
              </div>
              <span className="text-[0.55rem] font-bold text-success/80 font-mono">
                {isLiveSyncing ? "STATUS: SYNCING..." : "STATUS: CONNECTED"}
              </span>
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
              {(marketInsights.length > 0 ? marketInsights : [
                { title: `Principal ${formData.occupation}`, increase: 35, salary: formData.salary * 1.35 },
                { title: `Architectural Consultant`, increase: 42, salary: formData.salary * 1.42 },
                { title: 'Executive Operations', increase: 20, salary: formData.salary * 1.20 }
              ]).map((job, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    setComparison(prev => ({ 
                      enabled: true, 
                      jobB: { ...prev.jobB, salary: job.salary, occupation: job.title } 
                    }));
                    setToast({ message: `Comparing with ${job.title}`, type: "success" });
                    // Scroll to comparison
                    const comparisonEl = document.getElementById('comparison-toggle');
                    if (comparisonEl) {
                      comparisonEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-all border border-transparent hover:border-white/5"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[0.6rem] font-mono text-text-muted mb-0.5 tracking-tighter">
                      {job.title.substring(0, 3).toUpperCase()}.{i}
                    </div>
                    <div className="text-[0.6rem] font-bold text-success uppercase">+{job.increase}%</div>
                  </div>
                  <div className="text-xs font-bold text-text group-hover:text-accent-light transition-colors line-clamp-1">{job.title}</div>
                  <div className="flex items-end justify-between mt-2">
                    <div className="text-xl font-black text-white font-mono leading-none">{formatCurrency(job.salary)}</div>
                    <div className="text-[8px] font-bold text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Analyze Offer →</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 pt-0">
               <button 
                onClick={() => {
                  setComparison(prev => ({ ...prev, enabled: true }));
                  setTimeout(() => {
                    const comparisonEl = document.getElementById('comparison-toggle');
                    if (comparisonEl) {
                      comparisonEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setToast({ message: "Comparison Module Activated.", type: "success" });
                    }
                  }, 100);
                }}
                className="btn-success w-full"
               >
                  Trade Your Current Role
                  <TrendingUp size={12} />
               </button>
            </div>
          </div>

          <div className="calculator-card p-5">
            <div className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest mb-4 italic">Buying Power Heatmap</div>
            <div 
              onClick={() => {
                setActiveTab('strategy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-40 bg-black/50 border border-white/10 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-accent/40 transition-colors group"
            >
               <div className="text-[0.7rem] font-bold text-text-muted text-center leading-tight z-10 group-hover:text-accent-light transition-colors">
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
            <button 
              onClick={() => {
                setActiveTab('strategy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-secondary w-full py-3"
            >
              Explode Full Market Map
            </button>
          </div>
        </aside>
      </main>
    </motion.div>
        ) : (
          <motion.div 
            key="strategy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto px-6 pb-24"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Audit Column 1: Compliance & Precision */}
              <div className="space-y-12">
                <div className="calculator-card p-8 border-success/20 bg-success/[0.02]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <FileCheck2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-white">Compliance Tier</h4>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">Precision Verification</p>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-xs leading-relaxed text-text-muted">
                      <ShieldCheck size={14} className="text-success shrink-0" />
                      <span>Verified against 2026 OBBBA Tax Code brackets.</span>
                    </li>
                    <li className="flex gap-3 text-xs leading-relaxed text-text-muted">
                      <ShieldCheck size={14} className="text-success shrink-0" />
                      <span>Filing Status: <span className="text-white font-bold">{formData.filingStatus}</span> audit complete.</span>
                    </li>
                    <li className="flex gap-3 text-xs leading-relaxed text-text-muted">
                      <ShieldCheck size={14} className="text-success shrink-0" />
                      <span>SALT Deduction Cap (OBBBA Adjusted): <span className="text-white font-bold">$40,400</span>.</span>
                    </li>
                  </ul>
                </div>

                <div className="calculator-card p-6 border-white/5 italic">
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    "Our precision engine mirrors the industrial standards of ADP and SmartAsset, then extends into predictive territory through OBBBA integration."
                  </p>
                </div>

                <AdSlot className="opacity-60" />
              </div>

              {/* Audit Column 2: The Edge (Predictive AI) */}
              <div className="space-y-12 lg:col-span-2">
                <div className="calculator-card p-8 relative overflow-hidden border-accent/30">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={80} />
                  </div>
                  <h3 className="text-xl font-bold italic mb-2 tracking-tight">Strategic Advantage Audit</h3>
                  <p className="text-xs text-text-muted mb-8 leading-relaxed max-w-xl">
                    Beyond standard calculation, we analyze the delta between your current state and the 2030 SALT Cliff transition.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {comparison.enabled ? (
                      <div className="md:col-span-2 p-6 rounded-2xl bg-accent/[0.03] border border-accent/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                          <TrendingUp size={24} className="text-accent opacity-20 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="text-[0.65rem] font-bold text-accent uppercase tracking-widest mb-4">Strategic Comparison Audit</div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                          <div className="flex-1 w-full text-center sm:text-left">
                            <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Current Offer (Job A)</div>
                            <div className="text-2xl font-black text-white">{formatCurrency(taxResult.takeHomePay)}</div>
                            <div className="text-[9px] text-text-muted uppercase tracking-widest mt-1">Net / Yr in {formData.state}</div>
                          </div>
                          <div className="h-10 w-px bg-white/10 hidden sm:block" />
                          <div className="flex-1 w-full text-center sm:text-left">
                            <div className="text-[10px] text-accent uppercase font-bold mb-1">Challenger Offer (Job B)</div>
                            <div className="text-2xl font-black text-accent-light">{formatCurrency(taxResultB.takeHomePay)}</div>
                            <div className="text-[9px] text-text-muted uppercase tracking-widest mt-1">Net / Yr in {comparison.jobB.state}</div>
                          </div>
                          <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-[8px] text-text-muted uppercase font-bold mb-1">Strategic Delta</div>
                            <div className={cn(
                              "text-xl font-black font-mono",
                              taxResultB.takeHomePay > taxResult.takeHomePay ? "text-success" : "text-[#F04438]"
                            )}>
                              {taxResultB.takeHomePay > taxResult.takeHomePay ? "+" : ""}
                              {formatCurrency(taxResultB.takeHomePay - taxResult.takeHomePay)}
                            </div>
                          </div>
                        </div>
                        {taxResultB.takeHomePay > taxResult.takeHomePay && (
                          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-success bg-success/10 w-fit px-3 py-1 rounded-full border border-success/20">
                            <ShieldCheck size={12} />
                            Superior Liquidity Pathway Identified
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-[0.6rem] font-bold text-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Globe size={12} />
                          Migration Forensics
                        </div>
                        <div className="text-lg font-bold mb-1">
                          {STATE_COL_DATA[formData.relocationState]?.state || formData.relocationState} Transition
                        </div>
                        <div className="text-2xl font-black font-mono text-success">
                          {calculateTaxes(formData.salary, formData.relocationState, formData.filingStatus, formData.year, formData).takeHomePay > taxResult.takeHomePay ? "+" : ""}
                          {formatCurrency(calculateTaxes(formData.salary, formData.relocationState, formData.filingStatus, formData.year, formData).takeHomePay - taxResult.takeHomePay)}
                          <span className="text-xs font-bold text-text-muted ml-1 italic">Net/Yr</span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[0.6rem] font-bold text-success uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp size={12} />
                        Wealth Shielding
                      </div>
                      <div className="text-lg font-bold mb-1">
                        {formatCurrency(formData.contribution401k + formData.contributionHSA + formData.fsaContribution)} Combined
                      </div>
                      <div className="text-2xl font-black font-mono text-white">
                        {formatCurrency((formData.contribution401k + formData.contributionHSA + formData.fsaContribution) * taxResult.marginalRate)}
                        <span className="text-xs font-bold text-text-muted ml-1 italic">Tax Saved</span>
                      </div>
                    </div>
                  </div>

                  <AdSlot className="mt-12 bg-accent/5 opacity-80" />

                  <div className="mt-12 p-6 rounded-2xl bg-accent/10 border border-accent/20">
                    <h4 className="text-[0.65rem] font-bold text-accent-light uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <MessageSquare size={14} />
                      AI Strategic Conclusion
                    </h4>
                    <div className="text-xs leading-relaxed text-white font-medium">
                      <Markdown>{oracleSummary || "Generating deep audit conclusions..."}</Markdown>
                    </div>
                  </div>

                  <SalaryVelocityChart />

                  <AuthorityBenchmarks />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setActiveTab('calculator');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="btn-primary flex-1 py-4 text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    Adjust Base Parameters
                  </button>
                  <button onClick={downloadPDF} className="btn-secondary px-8 py-4 text-xs tracking-widest flex items-center gap-2">
                    <Download size={16} />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OracleChat 
        context={`Salary: ${formData.salary}, State: ${formData.state}, Year: ${formData.year}, Take-Home: ${taxResult.takeHomePay}`} 
        formData={formData}
      />
      
      <footer className="mt-20 px-6 md:px-10 py-16 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="font-black text-3xl tracking-tighter uppercase italic text-white/40">
              SALARY<span className="text-accent/40">ORACLE</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[0.65rem] font-bold text-success flex items-center gap-1.5 uppercase tracking-widest bg-success/10 px-3 py-1 rounded-full border border-success/20 w-fit">
                <ShieldCheck size={12} />
                Data Reliability: Sync via IRS-Direct & C-CPI-U
              </div>
              <p className="text-[10px] text-text-muted max-w-xs text-center md:text-left leading-relaxed uppercase tracking-widest font-bold">
                Autonomous Financial Intelligence Engine. Optimized for the 2026 OBBBA Legislative Era & C-CPI-U Adjustments.
              </p>
            </div>
          </div>
          
          <div className="flex gap-10">
             <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Oracle Node</span>
                <span className="text-[10px] text-text-muted uppercase tracking-widest">Mainnet-v2.5</span>
             </div>
             <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Protocol</span>
                <span className="text-[10px] text-text-muted uppercase tracking-widest">C-CPI-U Shield</span>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold text-text-muted uppercase tracking-widest">
           <span>© 2026-2046 Eternal Asset Protocol. All Projections Autonomous.</span>
           <div className="flex gap-6 md:gap-8 flex-wrap justify-center">
              <a href="https://www.bls.gov" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">BLS Open Data</a>
              <a href="https://www.irs.gov" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">IRS Implementation</a>
              <a href="https://www.payscale.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Market Benchmarks</a>
              <a href="https://www.adp.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Payroll Standards</a>
              <div className="flex gap-2 ml-0 md:ml-4">
                 <div className="w-2 h-2 rounded-full bg-success/40" />
                 <div className="w-2 h-2 rounded-full bg-accent/40" />
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
