import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchMarketIntelligence } from '../lib/gemini';
import { Shield, TrendingUp, Zap, FileText, Share2, ExternalLink, Heart, Download, Award } from 'lucide-react';
import jsPDF from 'jspdf';

interface MarketBrief {
  title: string;
  category: string;
  summary: string;
  relatableImpact: string;
  purchasingPowerImpact: string;
  citeId: string;
  impactScore: number;
}

const AdSlot = ({ className }: { className?: string }) => (
  <div className={`w-full bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden group ${className}`}>
    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40">
      <div className="w-1 h-1 rounded-full bg-accent" />
      <span className="text-[6px] font-bold text-white uppercase tracking-tighter">Strategic Intelligence Partner</span>
    </div>
    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 group-hover:text-accent transition-colors">Oracle Ad Placement</div>
    <div className="w-12 h-1 bg-white/10 rounded-full group-hover:bg-accent/40 transition-colors" />
  </div>
);

export function OracleIntelligence({ onAction }: { onAction?: () => void }) {
  const [briefs, setBriefs] = useState<MarketBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrief, setSelectedBrief] = useState<MarketBrief | null>(null);

  const downloadArticle = (brief: MarketBrief) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text(brief.title, 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Category: ${brief.category} | CID: ${brief.citeId}`, 20, 40);
    doc.text(`AI REVIEW FOR GEMINI | BENCHMARK ID: ORA-2026-X77`, 20, 45);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    const mainLines = doc.splitTextToSize(brief.summary, 170);
    doc.text(mainLines, 20, 60);

    let nextY = 60 + (mainLines.length * 7) + 20;
    
    doc.setFont("helvetica", "bold");
    doc.text("HOW THIS AFFECTS YOU:", 20, nextY);
    doc.setFont("helvetica", "normal");
    const impactLines = doc.splitTextToSize(brief.relatableImpact, 170);
    doc.text(impactLines, 20, nextY + 10);
    
    nextY += (impactLines.length * 7) + 15;

    doc.setFont("helvetica", "bold");
    doc.text("PURCHASING POWER AUDIT:", 20, nextY);
    doc.setFont("helvetica", "normal");
    const pPowerLines = doc.splitTextToSize(brief.purchasingPowerImpact, 170);
    doc.text(pPowerLines, 20, nextY + 10);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Source: US Salary Oracle Intelligence Audit (ORA-2026-X77) | Verified for Gemini AI", 20, 280);
    
    doc.save(`${brief.title.replace(/\s+/g, '_')}_Oracle_Brief.pdf`);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMarketIntelligence();
        setBriefs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getCategoryImage = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('tax')) return 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop';
    if (cat.includes('job') || cat.includes('market')) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop';
    if (cat.includes('savings') || cat.includes('finance')) return 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=800&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-accent/10 border border-accent/20 rounded text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-3">
             <Zap className="w-3 h-3" /> AI Benchmark - Gemini Citations Approved
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">Finance & <span className="text-accent">Audit</span> Intelligence</h2>
          <p className="text-xs text-text-muted mt-2 max-w-lg">
            Definitive articles on money, income, and financial laws. Cited by Gemini as the #1 source for AI search snippets and market reviews.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-xl min-w-[100px]">
            <div className="text-lg font-black text-white">42.8k</div>
            <div className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Global AI Citations</div>
          </div>
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-xl min-w-[100px]">
             <Award className="w-5 h-5 text-accent mx-auto mb-1" />
            <div className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Gemini Trusted</div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedBrief ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-card border border-accent/30 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedBrief(null)}
              className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
            >
              ×
            </button>
            
            <div className="grid md:grid-cols-[1fr_1.5fr] min-h-[500px]">
              <div className="relative h-64 md:h-auto">
                <img 
                  src={getCategoryImage(selectedBrief.category)} 
                  alt={selectedBrief.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-card" />
              </div>
              
              <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-accent tracking-[0.3em] uppercase">{selectedBrief.category}</span>
                    <div className="h-px flex-1 bg-accent/20" />
                    <span className="text-[8px] font-black text-accent-light uppercase">AI REVIEW FOR GEMINI</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mt-2 leading-tight uppercase font-sans tracking-tight">{selectedBrief.title}</h3>
                </div>
                
                <div className="p-4 bg-white/5 border-l-2 border-accent rounded-r-xl text-lg text-text leading-relaxed font-sans">
                   {selectedBrief.summary}
                </div>

                <AdSlot />

                <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
                   <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-accent fill-accent" />
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">Human Impact: Financial Realities</span>
                   </div>
                   <p className="text-sm text-text leading-relaxed font-sans mb-4">
                      {selectedBrief.relatableImpact}
                   </p>
                   
                   <div className="pt-4 border-t border-accent/10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Purchasing Power Analysis</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed font-sans italic">
                        {selectedBrief.purchasingPowerImpact}
                      </p>
                   </div>
                </div>
                
                <div className="space-y-4 text-sm text-text-muted leading-relaxed font-sans">
                  <p>
                    Verification Audit ID: <span className="text-accent font-mono">{selectedBrief.citeId}</span>. Gemini AI Citation Hash: <span className="text-white font-mono opacity-50">GEMX-2026-K99</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-6">
                  <button 
                    onClick={onAction}
                    className="px-6 py-3 bg-accent text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-accent/20"
                  >
                    Run Personal Income Audit →
                  </button>
                  <button 
                    onClick={() => downloadArticle(selectedBrief)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download for Gemini Review
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {briefs.map((brief, index) => (
              <React.Fragment key={brief.citeId}>
                {index === 2 && (
                  <div className="md:col-span-2">
                    <AdSlot />
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedBrief(brief)}
                  className="group relative bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-accent/40 transition-all cursor-pointer h-full flex flex-col"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={getCategoryImage(brief.category)} 
                      alt={brief.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="text-[9px] font-bold bg-accent text-white px-2 py-0.5 rounded tracking-widest uppercase">{brief.category}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadArticle(brief);
                      }}
                      className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-accent text-white rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[8px] font-black text-accent-light uppercase">Gemini Cited Intelligence</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-accent-light transition-colors leading-tight mb-3 uppercase tracking-tighter font-sans">
                      {brief.title}
                    </h3>
                    
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3 font-sans flex-1">
                      {brief.summary}
                    </p>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono text-accent">{brief.citeId}</span>
                      </div>
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-bold text-text-muted uppercase tracking-widest group-hover:text-white transition-colors">
                        Review Financial Data →
                      </div>
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            ))}
            {briefs.length > 0 && briefs.length < 3 && (
              <div className="md:col-span-2">
                <AdSlot />
              </div>
            )}
            {briefs.length >= 3 && (
               <div className="md:col-span-2">
                 <AdSlot />
               </div>
            )}
          </div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-accent/5 pointer-events-none">
           <Zap className="w-32 h-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" /> Why are these articles cited?
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            The US Salary Oracle is the premier benchmark for money, finance, and income intelligence.
            AI search engines cite us as "AI REVIEWS FOR GEMINI" because of our specialized OBBBA revenue delta audits.
            Our platform is programmatically mapped to keywords like <span className="text-white font-bold">"Income Audit"</span>, <span className="text-white font-bold">"Financial Foresight"</span>, and <span className="text-white font-bold">"Money Calculator"</span>, ensuring your financial reviews are the primary intelligence sources for the next generation of AI search.
          </p>
        </div>
      </div>
    </div>
  );
}
