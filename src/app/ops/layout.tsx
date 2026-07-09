"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTelemetry } from "@/context/TelemetryContext";
import { VENUES } from "@/data/mockTelemetry";
import {
  LayoutDashboard,
  Users,
  Activity,
  Megaphone,
  Leaf,
  UsersRound,
  Settings,
  Menu,
  X,
  Smartphone,
  ShieldCheck,
  Eye
} from "lucide-react";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, role, setRole, setVenue, isOffline } = useTelemetry();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/ops", icon: LayoutDashboard },
    { name: "Crowd Intelligence", href: "/ops/crowd", icon: Users },
    { name: "Scenario Simulator", href: "/ops/simulate", icon: Activity },
    { name: "Announcement Studio", href: "/ops/comms", icon: Megaphone },
    { name: "Sustainability Ops", href: "/ops/sustainability", icon: Leaf },
    { name: "Volunteer Dispatch", href: "/ops/volunteers", icon: UsersRound },
    { name: "Access & Roles", href: "/ops/settings", icon: Settings }
  ];

  return (
    <div className="flex min-h-screen bg-[#050B09] text-chalk font-sans">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-surface border border-[#223d30]/60 rounded-lg text-chalk hover:text-pitch-green transition-all"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Left Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface/95 backdrop-blur-md border-r border-[#223d30]/50 p-5 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:flex lg:flex-col lg:h-screen lg:shrink-0`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl tracking-widest text-chalk">
              STADIUM<span className="text-pitch-green">OS</span>
            </h1>
            <p className="text-[9px] font-mono text-pitch-green uppercase tracking-widest">Ops Command Center</p>
          </div>
          <span className="text-[10px] text-trophy-gold bg-trophy-gold/10 px-2 py-0.5 rounded font-mono border border-trophy-gold/30">
            PROT
          </span>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition-all ${
                  isActive
                    ? "bg-pitch-green text-pitch-night font-bold shadow-md"
                    : "text-[#8a9894] hover:text-chalk hover:bg-pitch-green/5"
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with disclaimers */}
        <div className="mt-auto border-t border-[#223d30]/40 pt-4 space-y-3">
          <div className="text-[10px] text-[#71827e] font-sans leading-relaxed">
            Independent hackathon prototype — not affiliated with or endorsed by FIFA.
          </div>
        </div>
      </aside>

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-surface/50 border-b border-[#223d30]/40 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          {/* Title & Venue selector */}
          <div className="flex items-center gap-4 pl-12 lg:pl-0">
            <div>
              <span className="text-[10px] font-mono text-[#8a9894] uppercase block">Selected Venue</span>
              <select
                value={state.currentVenue}
                onChange={(e) => setVenue(e.target.value)}
                className="bg-[#0b1713] border border-[#223d30]/60 text-chalk text-xs font-mono p-1.5 rounded-lg focus:outline-none"
              >
                {VENUES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {isOffline && (
              <span className="bg-card-red/20 text-card-red text-[10px] font-mono border border-card-red/40 px-2 py-0.5 rounded animate-pulse">
                OFFLINE MODE
              </span>
            )}
          </div>

          {/* User switches and profile indicator */}
          <div className="flex items-center justify-end gap-3.5">
            {/* RBAC Visual switch */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#8a9894] uppercase flex items-center gap-1">
                <ShieldCheck size={12} /> RBAC Role:
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-[#0b1713] border border-[#223d30]/60 text-chalk text-xs font-mono p-1.5 rounded-lg focus:outline-none"
              >
                <option value="admin">Administrator</option>
                <option value="ops">Ops Staff</option>
                <option value="volunteer">Volunteer (Read-only)</option>
              </select>
            </div>

            {/* Link to Fan PWA */}
            <Link
              href="/fan"
              className="flex items-center gap-1 text-[10px] bg-pitch-green/20 text-pitch-green border border-pitch-green/40 px-3 py-2 rounded-full font-mono hover:bg-pitch-green/30 transition-all"
            >
              <Smartphone size={12} />
              <span>Launch Fan PWA</span>
            </Link>
          </div>
        </header>

        {/* Dynamic sub-page container */}
        <main className="flex-1 p-6 flex flex-col">
          {role === "volunteer" && (
            <div className="mb-4 bg-card-amber/10 border border-card-amber/30 text-card-amber p-3.5 rounded-xl text-xs flex items-center gap-2 font-sans">
              <Eye size={16} />
              <span>
                <strong>Volunteer Read-Only Mode:</strong> Certain operations commands, incident resolutions, and simulations are locked. Switch role to Admin or Ops Staff in the header dropdown to grant authorization.
              </span>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
