"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { queryKnowledgeBase } from "@/ai/ragKnowledge";
import { UsersRound, Search, Send, Check, HelpCircle, Sparkles, BookOpen } from "lucide-react";

export default function OpsVolunteers() {
  const { state, role, dispatchTask } = useTelemetry();
  const [sopQuery, setSopQuery] = useState("");
  const [sopResults, setSopResults] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [targetZone, setTargetZone] = useState("Concourse A (Gates 1 & 2)");
  const [selectedVol, setSelectedVol] = useState(state.volunteers[0]?.id || "");

  const isReadOnly = role === "volunteer";

  const handleSopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sopQuery.trim()) return;
    const res = queryKnowledgeBase(sopQuery, 2);
    setSopResults(res);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedVol) return;
    dispatchTask(taskTitle, targetZone, selectedVol);
    setTaskTitle("");
  };

  return (
    <div className="space-y-6">
      {/* Search SOP database */}
      <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-pitch-green" size={16} />
          <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Volunteer SOP Copilot & Knowledge Search</h3>
        </div>

        <form onSubmit={handleSopSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-[#8a9894]" size={16} />
            <input
              type="text"
              value={sopQuery}
              onChange={(e) => setSopQuery(e.target.value)}
              placeholder="Search Standard Operating Procedures (e.g., lost child, medical, sensory bags)..."
              className="w-full bg-[#0b1713] text-xs text-chalk pl-10 pr-4 py-2.5 rounded-lg border border-[#223d30]/60 focus:outline-none focus:border-pitch-green"
            />
          </div>
          <button
            type="submit"
            className="bg-[#1a382a] border border-[#223d30]/60 text-chalk text-xs font-mono px-5 py-2.5 rounded-lg hover:text-pitch-green transition-all"
          >
            Search
          </button>
        </form>

        {/* Search Results */}
        {sopResults.length > 0 && (
          <div className="space-y-3 bg-[#0c1a15]/50 p-4 rounded-xl border border-pitch-green/20">
            <div className="text-[10px] text-pitch-green font-mono uppercase font-bold flex items-center gap-1">
              <Sparkles size={12} /> Retrieved SOP Documentation
            </div>
            {sopResults.map((doc, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <h5 className="font-semibold text-chalk">{doc.title}</h5>
                <p className="text-[#8a9894] leading-relaxed">{doc.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Dispatch controls vs Volunteers status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Dispatch Task Form */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-[#223d30]/40 pb-3">
            <UsersRound className="text-pitch-green" size={16} />
            <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Dispatch Copilot Task</h3>
          </div>

          <form onSubmit={handleDispatch} className="mt-4 space-y-4 flex-1">
            <div className="space-y-1">
              <label className="block text-[10px] text-[#8a9894] font-mono uppercase">Task Description</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                disabled={isReadOnly}
                required
                placeholder="e.g. Check wheelchair lift Gate 3..."
                className="w-full bg-[#0b1713] text-xs text-chalk p-2 rounded-lg border border-[#223d30]/60 focus:outline-none focus:border-pitch-green"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-[#8a9894] font-mono uppercase">Assigned Concourse Zone</label>
              <select
                value={targetZone}
                onChange={(e) => setTargetZone(e.target.value)}
                disabled={isReadOnly}
                className="w-full bg-[#0b1713] text-xs text-chalk p-2 rounded-lg border border-[#223d30]/60 focus:outline-none"
              >
                {state.zones.map(z => (
                  <option key={z.id} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] text-[#8a9894] font-mono uppercase">Assign Volunteer</label>
              <select
                value={selectedVol}
                onChange={(e) => setSelectedVol(e.target.value)}
                disabled={isReadOnly}
                className="w-full bg-[#0b1713] text-xs text-chalk p-2 rounded-lg border border-[#223d30]/60 focus:outline-none"
              >
                {state.volunteers.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.role} - {v.status})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isReadOnly || !taskTitle.trim()}
              className="w-full bg-pitch-green text-pitch-night font-bold uppercase tracking-wider text-xs py-2.5 rounded-lg hover:bg-opacity-90 active:scale-98 disabled:opacity-30 transition-all flex items-center justify-center gap-1 font-mono"
            >
              <Send size={14} />
              <span>Dispatch Volunteer</span>
            </button>
          </form>
        </div>

        {/* Right Columns: Active Volunteers roster grid */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#223d30]/40 pb-3">
            <div className="flex items-center gap-2">
              <UsersRound className="text-pitch-green" size={16} />
              <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Volunteer Roster Status</h3>
            </div>
            <span className="text-[10px] font-mono text-[#8a9894] uppercase bg-pitch-night border border-[#223d30]/60 px-2.5 py-0.5 rounded">
              Active Relays
            </span>
          </div>

          <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto no-scrollbar">
            {state.volunteers.map((vol) => {
              // Status badges
              const badgeClass = vol.status === "active" ? "bg-pitch-green text-pitch-night" : (vol.status === "break" ? "bg-card-amber text-pitch-night" : "bg-pitch-night text-[#8a9894] border border-[#223d30]/50");

              return (
                <div key={vol.id} className="p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-chalk">{vol.name}</span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${badgeClass}`}>
                        {vol.status}
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-[#8a9894] font-mono uppercase">
                      Role: {vol.role} | Assigned: {vol.assignedZone.split(" ")[0]} {vol.assignedZone.split(" ")[1] || ""}
                    </div>
                  </div>

                  {vol.currentTask ? (
                    <div className="mt-2 p-2 bg-surface border border-pitch-green/20 rounded text-[11px] text-chalk leading-relaxed">
                      <span className="text-pitch-green font-bold font-mono text-[9px] uppercase block mb-0.5">Active Mission</span>
                      "{vol.currentTask}"
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-[#8a9894] italic">
                      Standing by for dispatch.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
