"use client";

import React from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { ShieldCheck, Eye, Compass, HeartHandshake, HelpCircle } from "lucide-react";

export default function FanAccess() {
  const { wheelchairMode, setWheelchairMode, simplifiedMode, setSimplifiedMode } = useTelemetry();

  return (
    <div className="space-y-4">
      {/* Introduction text */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 space-y-2">
        <h3 className="text-xs text-[#8a9894] font-mono uppercase tracking-wider flex items-center gap-1.5">
          <HeartHandshake size={14} className="text-pitch-green" /> Accessibility Services
        </h3>
        <p className="text-xs text-chalk leading-relaxed">
          StadiumOS AI supports customized configurations for spectators requiring physical or cognitive assistive utilities during match day.
        </p>
      </div>

      {/* Toggles Panel */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 space-y-4">
        <h4 className="text-[10px] text-[#8a9894] font-mono uppercase border-b border-[#223d30]/40 pb-2">Assistive Settings</h4>

        {/* Wheelchair Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-chalk block">Wheelchair-Optimized Route</span>
            <span className="text-[10px] text-[#8a9894] block">Avoid stairs, highlight elevators in maps</span>
          </div>
          
          <button
            onClick={() => setWheelchairMode(!wheelchairMode)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
              wheelchairMode ? "bg-pitch-green" : "bg-pitch-night border border-[#223d30]/60"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-chalk transition-transform duration-200 ${
                wheelchairMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Simplified Language Mode Toggle */}
        <div className="flex items-center justify-between border-t border-[#223d30]/30 pt-3">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-chalk block">Simplified Language Mode</span>
            <span className="text-[10px] text-[#8a9894] block">Shorter sentences, larger fonts app-wide</span>
          </div>

          <button
            onClick={() => setSimplifiedMode(!simplifiedMode)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
              simplifiedMode ? "bg-pitch-green" : "bg-pitch-night border border-[#223d30]/60"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-chalk transition-transform duration-200 ${
                simplifiedMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sensory & Quiet Zones Guide */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 space-y-3">
        <h4 className="text-[10px] text-[#8a9894] font-mono uppercase border-b border-[#223d30]/40 pb-2">Sensory & Quiet Zones</h4>

        <div className="space-y-3">
          <div className="flex gap-3 text-xs bg-pitch-night/40 p-3 rounded-lg border border-[#223d30]/20">
            <div className="w-6 h-6 rounded bg-[#2e748b]/20 border border-[#2e748b]/40 flex items-center justify-center text-[#2e748b] shrink-0 font-bold font-mono">A</div>
            <div>
              <h5 className="font-semibold text-chalk">Section 104 Quiet Room</h5>
              <p className="text-[11px] text-[#8a9894] mt-0.5">Located inside Concourse A (North side). Access via elevator at Gate 1. Includes sensory bags, dim lighting, and noise-reducing headphones.</p>
            </div>
          </div>

          <div className="flex gap-3 text-xs bg-pitch-night/40 p-3 rounded-lg border border-[#223d30]/20">
            <div className="w-6 h-6 rounded bg-[#2e748b]/20 border border-[#2e748b]/40 flex items-center justify-center text-[#2e748b] shrink-0 font-bold font-mono">D</div>
            <div>
              <h5 className="font-semibold text-chalk">Section 218 Sensory Facility</h5>
              <p className="text-[11px] text-[#8a9894] mt-0.5">Located inside Concourse D (Southwest side). Access via elevator at Gate 5. Equipped with sensory bubble tubes, padded seating, and tactile walls.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Assistance steward notes */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 space-y-2">
        <h4 className="text-[10px] text-[#8a9894] font-mono uppercase flex items-center gap-1.5"><ShieldCheck size={12} className="text-pitch-green" /> Request Active Support</h4>
        <p className="text-xs text-chalk">
          If you require wheelchair transfers or immediate escort assistance, speak to any volunteer displaying a green badge, or request support via the **Assist** AI Concierge chat.
        </p>
      </div>
    </div>
  );
}
