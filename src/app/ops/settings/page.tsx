"use client";

import React from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { VENUES } from "@/data/mockTelemetry";
import { Settings, Shield, Globe, Terminal, ShieldAlert } from "lucide-react";

export default function OpsSettings() {
  const { state, role, setRole, setVenue } = useTelemetry();

  return (
    <div className="space-y-6">
      {/* Access & Roles configuration panel */}
      <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#223d30]/40 pb-3">
          <Shield className="text-pitch-green" size={16} />
          <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Access & Role-Based Security Config</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Roster column description */}
          <div className="p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl space-y-3">
            <h4 className="font-bold text-xs text-pitch-green font-mono uppercase">1. Administrator (Root)</h4>
            <p className="text-[11px] text-[#8a9894] leading-relaxed">
              Full system authorizations enabled. Administrators can run scenario flow simulations, broadcast PA announcements, approve incident deployments, and override telemetry streams.
            </p>
            <button
              onClick={() => setRole("admin")}
              className={`w-full text-xs font-mono py-2 rounded-lg transition-all ${
                role === "admin"
                  ? "bg-pitch-green text-pitch-night font-bold"
                  : "bg-surface text-[#8a9894] border border-[#223d30]/60 hover:text-chalk"
              }`}
            >
              Select Admin Role
            </button>
          </div>

          <div className="p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl space-y-3">
            <h4 className="font-bold text-xs text-pitch-green font-mono uppercase">2. Operations Staff</h4>
            <p className="text-[11px] text-[#8a9894] leading-relaxed">
              Standard operations authorizations. Staff can assign volunteer tasks, approve emergency incident warnings, and generate PA drafts. Simulation configs are read-only.
            </p>
            <button
              onClick={() => setRole("ops")}
              className={`w-full text-xs font-mono py-2 rounded-lg transition-all ${
                role === "ops"
                  ? "bg-pitch-green text-pitch-night font-bold"
                  : "bg-surface text-[#8a9894] border border-[#223d30]/60 hover:text-chalk"
              }`}
            >
              Select Staff Role
            </button>
          </div>

          <div className="p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl space-y-3">
            <h4 className="font-bold text-xs text-card-amber font-mono uppercase">3. Volunteer (Read-Only)</h4>
            <p className="text-[11px] text-[#8a9894] leading-relaxed">
              Read-only operations status dashboard. Volunteers can search SOP protocols, monitor gate queue statuses, and review active dispatch tasks. Modifying commands is strictly locked.
            </p>
            <button
              onClick={() => setRole("volunteer")}
              className={`w-full text-xs font-mono py-2 rounded-lg transition-all ${
                role === "volunteer"
                  ? "bg-card-amber text-pitch-night font-bold"
                  : "bg-surface text-[#8a9894] border border-[#223d30]/60 hover:text-chalk"
              }`}
            >
              Select Volunteer Role
            </button>
          </div>
        </div>
      </div>

      {/* Venue configurations panel */}
      <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#223d30]/40 pb-3">
          <Globe className="text-pitch-green" size={16} />
          <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Venue & Local Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <label className="block text-[10px] text-[#8a9894] font-mono uppercase">Default Tournament Venue</label>
            <select
              value={state.currentVenue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-[#0b1713] border border-[#223d30]/60 text-chalk p-2.5 rounded-lg focus:outline-none font-mono"
            >
              {VENUES.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-[#8a9894] font-mono uppercase">Telemetry Update Sync Rate</label>
            <div className="bg-[#0b1713] border border-[#223d30]/60 text-chalk p-2.5 rounded-lg font-mono">
              4000 ms (client-side walk interval)
            </div>
          </div>
        </div>
      </div>

      {/* Security alert context */}
      <div className="bg-[#152420] border border-pitch-green/20 rounded-xl p-4 flex gap-3 text-xs">
        <ShieldAlert className="text-pitch-green shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="font-bold text-pitch-green font-mono uppercase text-[10px]">RBAC Enforced Client and API Server</h4>
          <p className="text-[#8a9894] leading-relaxed mt-1">
            Role validation parameters are synced into request headers and state cookies. In volunteer read-only sessions, action dispatches are intercepted and rejected server-side to guarantee system integrity during live operations.
          </p>
        </div>
      </div>
    </div>
  );
}
