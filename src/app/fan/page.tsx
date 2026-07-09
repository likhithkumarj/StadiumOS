"use client";

import React from "react";
import Link from "next/link";
import { useTelemetry } from "@/context/TelemetryContext";
import LiveStat from "@/components/shared/LiveStat";
import { Navigation, MessageSquare, AlertTriangle, AlertCircle, Droplets, Cloud, Sun, Calendar, ShieldCheck, Leaf } from "lucide-react";

export default function FanHome() {
  const { state, wheelchairMode, simplifiedMode } = useTelemetry();

  // Helper to format countdown into HH:MM:SS
  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Weather Icon mapping
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "Raining":
      case "Stormy":
        return <Droplets className="text-blue-400 animate-bounce" size={20} />;
      case "Overcast":
        return <Cloud className="text-gray-400 animate-pulse" size={20} />;
      default:
        return <Sun className="text-amber-400 rotate-slow" size={20} />;
    }
  };

  // Filter out dismissed or resolved incidents
  const activeAlerts = state.incidents.filter(inc => inc.status === "active" && !inc.dismissed);

  return (
    <div className="space-y-4">
      {/* Active Match Scoreboard Card */}
      <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-pitch-green text-pitch-night px-4 py-1 font-display text-xs uppercase rounded-bl-xl tracking-wider">
          Live Match
        </div>
        
        <div className="text-[10px] font-mono text-pitch-green uppercase tracking-wider mb-1 flex items-center gap-1">
          <Calendar size={12} /> FIFA World Cup 2026 Group Stage
        </div>
        
        <h2 className="font-display text-3xl tracking-wide text-chalk mb-3">
          {state.matchScore}
        </h2>

        {/* Kickoff countdown */}
        <div className="flex items-center justify-between border-t border-[#223d30]/50 pt-3">
          <span className="text-xs text-[#8a9894] font-sans">Kickoff Countdown</span>
          <div className="bg-[#0c1a15] px-3 py-1.5 rounded-lg border border-[#223d30]/30">
            <LiveStat 
              value={formatCountdown(state.kickoffCountdown)} 
              className="text-lg text-trophy-gold font-mono tracking-widest font-semibold" 
            />
          </div>
        </div>
      </div>

      {/* Active Incidents / Alerts (If Any) */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-3.5 rounded-xl border flex gap-3 ${
                alert.severity === "critical" 
                  ? "bg-card-red/10 border-card-red/30 text-card-red" 
                  : "bg-card-amber/10 border-card-amber/30 text-card-amber"
              }`}
            >
              {alert.severity === "critical" ? <AlertCircle size={20} className="shrink-0" /> : <AlertTriangle size={20} className="shrink-0" />}
              <div>
                <h4 className="font-bold text-xs font-sans tracking-wide uppercase">
                  {alert.severity === "critical" ? "Critical Alert" : "Caution Alert"}
                </h4>
                <p className="text-xs text-chalk mt-0.5">{alert.description}</p>
                {alert.approved && alert.aiRecommendation && (
                  <div className="mt-2 text-[10px] bg-pitch-night/60 p-2 rounded border border-pitch-green/20 text-[#8a9894]">
                    <span className="text-pitch-green font-bold uppercase">Steward Update:</span> {alert.aiRecommendation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Operations Overview grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weather card */}
        <div className="bg-surface rounded-xl p-3 border border-[#223d30]/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8a9894] block uppercase font-mono">Weather</span>
            <span className="text-sm font-semibold text-chalk">{state.weather}</span>
          </div>
          {getWeatherIcon(state.weather)}
        </div>

        {/* Temperature Card */}
        <div className="bg-surface rounded-xl p-3 border border-[#223d30]/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8a9894] block uppercase font-mono">Stadium Temp</span>
            <LiveStat value={state.temperature} suffix="°C" className="text-sm font-semibold text-chalk" />
          </div>
          <span className="text-[#8a9894] font-mono text-xs">Inside</span>
        </div>
      </div>

      {/* Fast gate checker */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40">
        <h3 className="text-xs text-[#8a9894] font-mono uppercase tracking-wider mb-3">Live Gate Queue Status</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {state.gates.map((gate) => (
            <div key={gate.id} className="flex items-center justify-between p-2 rounded bg-pitch-night/50 border border-[#223d30]/20">
              <span className="text-[#8a9894]">{gate.name.split(" ")[0]} {gate.name.split(" ")[1] || ""}</span>
              {gate.status === "closed" ? (
                <span className="text-card-red font-semibold font-mono text-[10px] uppercase">Closed</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    gate.status === "critical" ? "bg-card-red" : (gate.status === "caution" ? "bg-card-amber" : "bg-pitch-green")
                  }`} />
                  <LiveStat value={gate.queueTime} suffix=" min" className="text-chalk font-semibold" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Sustainability Nudge */}
      <div className="bg-pitch-green/10 border border-pitch-green/30 rounded-xl p-4 flex gap-3.5">
        <Leaf className="text-pitch-green shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="text-xs font-bold text-pitch-green uppercase tracking-wide">Green Transit Recommendation</h3>
          <p className="text-xs text-chalk/90 mt-1">
            {wheelchairMode 
              ? "Take the Light Rail (accessible platform near Gate 1) to save 1.8kg CO2 compared to driving." 
              : "Walk via the East Pedestrian Boulevard to burn calories and save 2.5kg CO2!"}
          </p>
        </div>
      </div>

      {/* Accessibility details snippet if wheelchairMode is enabled */}
      {wheelchairMode && (
        <div className="bg-[#15272a] border border-[#2e748b]/40 rounded-xl p-4 flex gap-3 text-xs">
          <div className="text-[#2e748b] font-bold">ADA</div>
          <div>
            <h4 className="font-bold text-[#2e748b] uppercase">Step-free routing is active</h4>
            <p className="text-[#8abac9] mt-0.5">Wayfinding maps are configured to automatically highlight elevator links and bypass stairs.</p>
          </div>
        </div>
      )}

      {/* Disclaimers & About project */}
      <div className="bg-surface/30 rounded-xl p-4 border border-[#223d30]/20 text-[10px] text-[#71827e] space-y-2">
        <div className="flex items-center gap-1.5 text-[#8a9894] font-bold uppercase font-mono text-[9px]">
          <ShieldCheck size={12} /> About this prototype
        </div>
        <p>
          This is an independent hackathon submission. Telemetry dashboard readouts, incident logs, and queue simulations are dynamically mocked.
        </p>
        <div className="border-t border-[#223d30]/30 pt-2 font-mono text-center">
          Independent hackathon prototype — not affiliated with or endorsed by FIFA.
        </div>
      </div>
    </div>
  );
}
