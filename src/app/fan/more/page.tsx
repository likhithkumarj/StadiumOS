"use client";

import React from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { Info, Leaf, User, ShieldAlert, Award } from "lucide-react";

export default function FanMore() {
  const { state, wheelchairMode } = useTelemetry();

  return (
    <div className="space-y-4">
      {/* Profile summary */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-pitch-green/20 border border-pitch-green/40 flex items-center justify-center text-pitch-green font-display text-xl">
          FA
        </div>
        <div>
          <h3 className="text-sm font-semibold text-chalk">Alex Johnson</h3>
          <span className="text-[10px] text-[#8a9894] font-mono uppercase">Ticket Category: Cat 1 | Seat 12A</span>
        </div>
      </div>

      {/* Eco Sustainability Footprint */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 space-y-3">
        <h4 className="text-[10px] text-[#8a9894] font-mono uppercase border-b border-[#223d30]/40 pb-2 flex items-center gap-1.5">
          <Leaf size={12} className="text-pitch-green" /> Match Day Eco Impact
        </h4>
        
        <div className="flex items-center justify-between bg-pitch-night/50 p-3 rounded-lg border border-[#223d30]/20">
          <div>
            <span className="text-[10px] text-[#8a9894] block uppercase font-mono">Carbon Savings Today</span>
            <span className="text-sm font-bold text-chalk">
              {wheelchairMode ? "1.8 kg CO2 (Shuttle)" : "2.5 kg CO2 (Walking)"}
            </span>
          </div>
          <Award className="text-trophy-gold" size={24} />
        </div>

        <p className="text-[11px] text-[#8a9894] leading-relaxed">
          By opting out of private vehicles, you help FIFA World Cup 2026 reach its zero-emission tournament targets.
        </p>
      </div>

      {/* Settings / Disclaimers */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 space-y-3">
        <h4 className="text-[10px] text-[#8a9894] font-mono uppercase border-b border-[#223d30]/40 pb-2 flex items-center gap-1.5">
          <ShieldAlert size={12} className="text-card-amber" /> Legal & Disclaimer
        </h4>

        <div className="text-[11px] text-[#8a9894] space-y-2 leading-relaxed">
          <p>
            <strong>StadiumOS AI</strong> is an independent hackathon prototype built to demonstrate smart-stadium operations and accessibility copilot capabilities.
          </p>
          <p>
            All telemetry metrics, simulated incidents, and AI notifications are generated procedurally on-device for review.
          </p>
          <p className="border-t border-[#223d30]/20 pt-2 font-mono text-[9px] text-center">
            Independent hackathon prototype — not affiliated with or endorsed by FIFA.
          </p>
        </div>
      </div>
    </div>
  );
}
