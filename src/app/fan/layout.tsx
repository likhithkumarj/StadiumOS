"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, MessageSquare, ShieldAlert, MoreHorizontal, WifiOff, RefreshCw, Smartphone } from "lucide-react";
import { useTelemetry } from "@/context/TelemetryContext";

export default function FanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOffline, resetTelemetry, state } = useTelemetry();
  const [showDesktopAlert, setShowDesktopAlert] = useState(false);

  const tabs = [
    { name: "Home", href: "/fan", icon: Home },
    { name: "Navigate", href: "/fan/navigate", icon: MapPin },
    { name: "Assist", href: "/fan/assist", icon: MessageSquare },
    { name: "Access", href: "/fan/access", icon: ShieldAlert },
    { name: "More", href: "/fan/more", icon: MoreHorizontal }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasDismissed = sessionStorage.getItem("dismissed_desktop_alert");
      if (window.innerWidth > 768 && !hasDismissed) {
        setShowDesktopAlert(true);
      }
    }
  }, []);

  const dismissAlert = () => {
    setShowDesktopAlert(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dismissed_desktop_alert", "true");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-[#050B09] md:py-8 min-h-screen">
      {/* Desktop Warning Overlay */}
      {showDesktopAlert && (
        <div className="fixed inset-0 bg-[#000000]/85 flex items-center justify-center p-6 z-50">
          <div className="bg-surface border border-pitch-green/30 max-w-sm w-full p-6 rounded-2xl shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-pitch-green/10 border border-pitch-green/30 flex items-center justify-center text-pitch-green mx-auto">
              <Smartphone size={24} className="animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display text-2xl uppercase tracking-wider text-chalk">Mobile Simulator Mode</h3>
              <p className="text-xs text-[#8a9894] leading-relaxed">
                The Fan Companion is designed exclusively for mobile PWA devices. 
              </p>
              <p className="text-xs text-chalk leading-relaxed font-semibold">
                For the best presentation experience, open Chrome DevTools (<kbd className="bg-pitch-night px-1 py-0.5 rounded border border-[#223d30] font-mono text-[10px]">F12</kbd>) and toggle the Device Toolbar (<kbd className="bg-pitch-night px-1 py-0.5 rounded border border-[#223d30] font-mono text-[10px]">Ctrl+Shift+M</kbd>).
              </p>
            </div>

            <button
              onClick={dismissAlert}
              className="w-full bg-pitch-green text-pitch-night font-bold uppercase tracking-widest text-xs py-2.5 rounded-lg active:scale-98 transition-all hover:bg-opacity-90 font-mono"
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}

      {/* Mobile PWA Shell Wrapper */}
      <div className="w-full max-w-md bg-pitch-night md:rounded-[40px] md:border-8 md:border-[#1d2724] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col min-h-screen md:min-h-[850px] relative overflow-hidden">
        
        {/* Top Status Bar Simulator */}
        <div className="bg-pitch-night text-[10px] px-6 py-2 flex items-center justify-between text-[#8a9894] font-mono border-b border-surface">
          <div>STADIUMOS v1.0.2</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pitch-green animate-pulse"></span>
            <span>LIVE telemetry</span>
          </div>
        </div>

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-card-red text-chalk px-4 py-2 text-xs flex items-center justify-between font-mono animate-pulse">
            <div className="flex items-center gap-2">
              <WifiOff size={14} />
              <span>OFFLINE: Live data paused</span>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-[10px] underline flex items-center gap-1 hover:text-white"
            >
              <RefreshCw size={10} /> Reconnect
            </button>
          </div>
        )}

        {/* Dynamic Mobile Surface Header */}
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-[#223d30]/50">
          <div>
            <h1 className="font-display text-xl tracking-wide text-chalk">
              STADIUM<span className="text-pitch-green">OS</span>
            </h1>
            <p className="text-[10px] font-mono text-pitch-green uppercase tracking-wider">{state.currentVenue}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/ops" 
              className="text-[10px] bg-pitch-green/20 text-pitch-green border border-pitch-green/40 px-2.5 py-1 rounded-full font-mono hover:bg-pitch-green/30 transition-all"
            >
              Switch to Ops
            </Link>
          </div>
        </header>

        {/* Scrollable Mobile Viewport */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 pt-4 flex flex-col">
          {children}
        </main>

        {/* Floating Mobile Tab Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-[#223d30]/80 py-2.5 px-4 flex items-center justify-around z-45">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive 
                    ? "text-pitch-green bg-pitch-green/10" 
                    : "text-[#8a9894] hover:text-chalk"
                }`}
              >
                <Icon size={20} className={isActive ? "scale-110 transition-transform" : ""} />
                <span className="text-[9px] font-medium tracking-wider font-sans uppercase">
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
