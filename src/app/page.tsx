"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, LayoutDashboard, Calendar, Sparkles } from "lucide-react";

export default function HomeLanding() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#050B09] px-6 py-12 min-h-screen text-chalk relative overflow-hidden">
      
      {/* Dynamic background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-pitch-green/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-trophy-gold/5 filter blur-[100px] pointer-events-none" />

      {/* Main content box */}
      <div className="w-full max-w-xl text-center space-y-8 z-10">
        
        {/* Logo and Headings */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-pitch-green/10 border border-pitch-green/20 rounded-full text-pitch-green text-xs font-mono uppercase tracking-wider animate-pulse">
            <Sparkles size={12} /> GenAI Smart Stadiums Platform
          </div>
          
          <h1 className="font-display text-6xl md:text-7xl tracking-wider text-chalk">
            STADIUM<span className="text-pitch-green">OS</span> AI
          </h1>
          
          <p className="text-sm text-[#8a9894] font-sans max-w-md mx-auto leading-relaxed">
            Operations command dashboard and mobile spectator copilot for the FIFA World Cup 2026 venues.
          </p>
        </div>

        {/* Big visual routing options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Option A: Fan Companion */}
          <Link
            href="/fan"
            className="group flex flex-col items-center justify-between p-6 bg-surface border border-[#223d30]/60 hover:border-pitch-green/60 hover:bg-[#11231c]/45 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="w-12 h-12 rounded-full bg-pitch-green/10 border border-pitch-green/20 flex items-center justify-center text-pitch-green group-hover:scale-110 transition-transform">
              <Smartphone size={24} />
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="font-display text-xl tracking-wide text-chalk uppercase">Fan Companion</h3>
              <p className="text-[11px] text-[#8a9894] leading-relaxed">
                Mobile-first PWA mockup. Features wayfinding pathfinder, multilingual RAG chat concierge, and wheelchair mode routing.
              </p>
            </div>
            <span className="mt-4 text-[10px] text-pitch-green font-mono uppercase group-hover:underline">
              Launch PWA Simulator &rarr;
            </span>
          </Link>

          {/* Option B: Ops Command Center */}
          <Link
            href="/ops"
            className="group flex flex-col items-center justify-between p-6 bg-surface border border-[#223d30]/60 hover:border-pitch-green/60 hover:bg-[#11231c]/45 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="w-12 h-12 rounded-full bg-pitch-green/10 border border-pitch-green/20 flex items-center justify-center text-pitch-green group-hover:scale-110 transition-transform">
              <LayoutDashboard size={24} />
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="font-display text-xl tracking-wide text-chalk uppercase">Ops Command Deck</h3>
              <p className="text-[11px] text-[#8a9894] leading-relaxed">
                Desktop administration portal. Includes crowd density heatmaps, flow scenario simulator, and PA broadcast studio.
              </p>
            </div>
            <span className="mt-4 text-[10px] text-pitch-green font-mono uppercase group-hover:underline">
              Launch Dashboard &rarr;
            </span>
          </Link>

        </div>

        {/* Footer disclaimers */}
        <div className="pt-8 border-t border-[#223d30]/40 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#8a9894] font-mono">
            <Calendar size={14} /> FIFA World Cup 2026 Venue Prototypes
          </div>
          <p className="text-[10px] text-[#71827e]">
            Independent hackathon prototype — not affiliated with or endorsed by FIFA.
          </p>
        </div>

      </div>
    </div>
  );
}
