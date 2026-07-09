"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import LiveStat from "@/components/shared/LiveStat";
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CloudRain,
  UserCheck,
  Check,
  X,
  RefreshCcw,
  Sparkles,
  Layers,
  BarChart3
} from "lucide-react";

export default function OpsOverview() {
  const {
    state,
    role,
    triggerRain,
    triggerGate4Closure,
    triggerSurge,
    resetTelemetry,
    approveIncidentAlert,
    dismissIncidentAlert
  } = useTelemetry();

  const isReadOnly = role === "volunteer";

  // Calculate statistics
  const activeIncidents = state.incidents.filter((inc) => inc.status === "active" && !inc.dismissed);
  const averageQueue = Math.round(
    state.gates.filter((g) => g.status !== "closed").reduce((acc, curr) => acc + curr.queueTime, 0) /
      state.gates.filter((g) => g.status !== "closed").length
  );
  
  const activeVolunteers = state.volunteers.filter((v) => v.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average Queue */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <span className="text-[10px] text-[#8a9894] uppercase tracking-wider font-mono">Average Queue Time</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <LiveStat value={averageQueue} className="text-4xl text-pitch-green font-bold" />
            <span className="text-xs text-[#8a9894] font-mono">min</span>
          </div>
          <span className="text-[10px] text-[#8a9894] mt-2 block">Across all active gates</span>
        </div>

        {/* Card 2: Active Incidents */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <span className="text-[10px] text-[#8a9894] uppercase tracking-wider font-mono">Active Incidents</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <LiveStat value={activeIncidents.length} className={`text-4xl font-bold ${activeIncidents.length > 0 ? "text-card-red animate-pulse" : "text-chalk"}`} />
            <span className="text-xs text-[#8a9894] font-mono">reports</span>
          </div>
          <span className="text-[10px] text-[#8a9894] mt-2 block">Requiring staff dispatch</span>
        </div>

        {/* Card 3: Active Volunteers */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <span className="text-[10px] text-[#8a9894] uppercase tracking-wider font-mono">Active Volunteers</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <LiveStat value={activeVolunteers} className="text-4xl text-trophy-gold font-bold" />
            <span className="text-xs text-[#8a9894] font-mono">stewards</span>
          </div>
          <span className="text-[10px] text-[#8a9894] mt-2 block">Dispatched on active tasks</span>
        </div>

        {/* Card 4: Weather & Attendance */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <span className="text-[10px] text-[#8a9894] uppercase tracking-wider font-mono">Venue Weather</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-semibold text-chalk">{state.weather}</span>
            <span className="text-xs text-[#8a9894] font-mono">{state.temperature}°C</span>
          </div>
          <span className="text-[10px] text-[#8a9894] mt-2 block">Total Attendance: {state.totalAttendance.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Panels Grid (Demo control vs Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Queue Times Chart (CSS-based) */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-[#223d30]/40 pb-3">
            <BarChart3 className="text-pitch-green" size={16} />
            <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Live Gate Queue Status</h3>
          </div>

          <div className="mt-4 flex-1 flex flex-col justify-around gap-4 min-h-[220px]">
            {state.gates.map((gate) => {
              // Calculate width % based on max time (say, 45 minutes)
              const widthPct = Math.min(100, (gate.queueTime / 45) * 100);
              const colorClass = gate.status === "closed" ? "bg-red-800" : (gate.status === "critical" ? "bg-card-red" : (gate.status === "caution" ? "bg-card-amber" : "bg-pitch-green"));

              return (
                <div key={gate.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8a9894]">{gate.name}</span>
                    {gate.status === "closed" ? (
                      <span className="text-card-red uppercase text-[10px] font-bold">Closed</span>
                    ) : (
                      <LiveStat value={gate.queueTime} suffix="m" className="text-chalk font-semibold" />
                    )}
                  </div>
                  <div className="w-full bg-[#0c1a15] h-3.5 rounded-full overflow-hidden border border-[#223d30]/20 relative">
                    {gate.status !== "closed" && (
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI recommendation Feed & Incident logs */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#223d30]/40 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-card-red animate-pulse" size={16} />
              <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">AI incident Feed & Commands</h3>
            </div>
            <span className="text-[10px] text-[#8a9894] font-mono uppercase bg-pitch-night border border-[#223d30]/60 px-2.5 py-0.5 rounded">
              Human-in-the-Loop Validation
            </span>
          </div>

          <div className="flex-1 mt-4 space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
            {activeIncidents.length === 0 ? (
              <div className="h-full flex items-center justify-center p-8 text-center text-xs text-[#8a9894] font-mono">
                No active incidents. Live telemetry streams normal.
              </div>
            ) : (
              activeIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 transition-all ${
                    incident.severity === "critical"
                      ? "bg-card-red/10 border-card-red/20"
                      : "bg-card-amber/10 border-card-amber/20"
                  } ${incident.approved ? "opacity-60" : ""}`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          incident.severity === "critical"
                            ? "bg-card-red text-chalk"
                            : "bg-card-amber text-pitch-night"
                        }`}
                      >
                        {incident.severity}
                      </span>
                      <span className="text-[10px] font-mono text-[#8a9894]">{incident.reportedTime} | {incident.location}</span>
                    </div>

                    <h4 className="font-bold text-sm text-chalk">{incident.title}</h4>
                    <p className="text-xs text-[#8a9894] leading-relaxed">{incident.description}</p>

                    {incident.aiRecommendation && (
                      <div className="mt-3 bg-pitch-night/60 p-3 rounded-lg border border-pitch-green/20">
                        <span className="text-[9px] font-mono font-bold text-pitch-green flex items-center gap-1 uppercase mb-1">
                          <Sparkles size={10} /> AI Recommendation Suggestion
                        </span>
                        <p className="text-xs text-chalk leading-relaxed">{incident.aiRecommendation}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  {!incident.approved && (
                    <div className="flex md:flex-col justify-end gap-2 shrink-0">
                      <button
                        onClick={() => approveIncidentAlert(incident.id)}
                        disabled={isReadOnly}
                        className="flex items-center gap-1 px-3 py-2 bg-pitch-green text-pitch-night text-xs font-bold font-mono rounded-lg hover:bg-opacity-90 active:scale-98 disabled:opacity-30 disabled:pointer-events-none transition-all uppercase"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => dismissIncidentAlert(incident.id)}
                        disabled={isReadOnly}
                        className="flex items-center gap-1 px-3 py-2 bg-pitch-night border border-[#223d30]/60 text-[#8a9894] hover:text-chalk text-xs font-mono rounded-lg active:scale-98 disabled:opacity-30 disabled:pointer-events-none transition-all uppercase"
                      >
                        <X size={14} /> Dismiss
                      </button>
                    </div>
                  )}
                  {incident.approved && (
                    <div className="text-[10px] font-mono text-pitch-green border border-pitch-green/30 px-3 py-1 rounded bg-pitch-green/10 flex items-center gap-1.5 self-start">
                      <UserCheck size={12} /> APPROVED & BROADCASTED
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Embedded Demo Simulation Control Panel */}
      <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#223d30]/40 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="text-trophy-gold" size={16} />
            <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Demo Controller Panel</h3>
          </div>
          <span className="text-[9px] font-mono text-trophy-gold uppercase">Use during presentation to force telemetry states</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <button
            onClick={triggerRain}
            disabled={isReadOnly}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1d3c33] border border-blue-500/20 text-blue-400 hover:bg-[#254d41] text-xs font-mono rounded-xl active:scale-98 disabled:opacity-30 transition-all uppercase font-semibold"
          >
            <CloudRain size={16} /> Trigger Rainstorm
          </button>

          <button
            onClick={triggerGate4Closure}
            disabled={isReadOnly}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1d3c33] border border-red-500/20 text-card-red hover:bg-[#254d41] text-xs font-mono rounded-xl active:scale-98 disabled:opacity-30 transition-all uppercase font-semibold"
          >
            <Flame size={16} /> Close Gate 4
          </button>

          <button
            onClick={triggerSurge}
            disabled={isReadOnly}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1d3c33] border border-amber-500/20 text-card-amber hover:bg-[#254d41] text-xs font-mono rounded-xl active:scale-98 disabled:opacity-30 transition-all uppercase font-semibold"
          >
            <ShieldAlert size={16} /> Spikes Surge
          </button>

          <button
            onClick={resetTelemetry}
            disabled={isReadOnly}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-pitch-night border border-[#223d30]/60 text-chalk hover:bg-surface text-xs font-mono rounded-xl active:scale-98 disabled:opacity-30 transition-all uppercase font-semibold"
          >
            <RefreshCcw size={16} /> Reset Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
