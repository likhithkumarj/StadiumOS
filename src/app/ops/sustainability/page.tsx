"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import LiveStat from "@/components/shared/LiveStat";
import { Leaf, Info, AlertTriangle, Sparkles, Send, Check } from "lucide-react";

export default function SustainabilityOps() {
  const { state, role, dispatchTask } = useTelemetry();
  const [dispatchedBinId, setDispatchedBinId] = useState<string | null>(null);

  const isReadOnly = role === "volunteer";

  const handleDispatch = (zoneName: string, binId: string) => {
    // Find an idle volunteer to assign
    const idleVol = state.volunteers.find(v => v.status === "idle") || state.volunteers[0];
    if (idleVol) {
      dispatchTask(`Clear Waste Bins in ${zoneName}`, zoneName, idleVol.id);
      setDispatchedBinId(binId);
      setTimeout(() => {
        setDispatchedBinId(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Offset */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <span className="text-[10px] text-[#8a9894] uppercase tracking-wider font-mono">Carbon Emission Offset</span>
          <div className="flex items-baseline gap-1 mt-2">
            <LiveStat value={1420} className="text-3xl text-pitch-green font-bold" />
            <span className="text-xs text-[#8a9894] font-mono">kg CO2</span>
          </div>
          <span className="text-[10px] text-[#8a9894] mt-2 block">Match day fan transit choices</span>
        </div>

        {/* Metric 2: Solar energy percentage */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <span className="text-[10px] text-[#8a9894] uppercase tracking-wider font-mono">Solar Grid Capacity</span>
          <div className="flex items-baseline gap-1 mt-2">
            <LiveStat value={42} className="text-3xl text-trophy-gold font-bold" />
            <span className="text-xs text-[#8a9894] font-mono">%</span>
          </div>
          <span className="text-[10px] text-[#8a9894] mt-2 block">Total venue electricity consumption</span>
        </div>

        {/* Metric 3: Water recycled */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <span className="text-[10px] text-[#8a9894] uppercase tracking-wider font-mono">Recycled Water Rate</span>
          <div className="flex items-baseline gap-1 mt-2">
            <LiveStat value={85} className="text-3xl text-pitch-green font-bold" />
            <span className="text-xs text-[#8a9894] font-mono">%</span>
          </div>
          <span className="text-[10px] text-[#8a9894] mt-2 block">Pitch irrigation and cooling</span>
        </div>
      </div>

      {/* Sustainability Telemetry table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Waste & Energy logs */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-[#223d30]/40 pb-3">
            <Leaf className="text-pitch-green" size={16} />
            <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Regional Sustainability Telemetry</h3>
          </div>

          <div className="mt-4 flex-1 space-y-4">
            {state.zones.map((zone) => {
              const binFull = zone.sustainability.wasteBinFill;
              const energyUse = zone.sustainability.energyUsage;
              const isFull = binFull > 75;

              return (
                <div key={zone.id} className="p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-xs text-chalk">{zone.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[#8a9894] block uppercase">Waste Bins Fullness</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`w-2 h-2 rounded-full ${isFull ? "bg-card-red animate-pulse" : "bg-pitch-green"}`} />
                          <LiveStat value={binFull} suffix="%" className="font-semibold text-chalk" />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8a9894] block uppercase">Energy Usage</span>
                        <LiveStat value={energyUse} suffix=" kW" className="font-semibold text-chalk" />
                      </div>
                    </div>
                  </div>

                  {/* AI recommendations actions */}
                  {isFull ? (
                    <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                      <span className="text-[9px] font-mono text-card-red uppercase bg-card-red/10 border border-card-red/20 px-2.5 py-1.5 rounded flex items-center gap-1">
                        <AlertTriangle size={10} /> Overflow Warning
                      </span>
                      <button
                        onClick={() => handleDispatch(zone.name, zone.id)}
                        disabled={isReadOnly || dispatchedBinId === zone.id}
                        className="bg-pitch-green text-pitch-night text-[10px] font-bold font-mono px-3 py-2 rounded hover:bg-opacity-90 active:scale-98 disabled:opacity-50 transition-all uppercase flex items-center gap-1"
                      >
                        {dispatchedBinId === zone.id ? <Check size={12} /> : <Send size={12} />}
                        <span>{dispatchedBinId === zone.id ? "Dispatched" : "Clear bin"}</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[9px] font-mono text-pitch-green uppercase bg-pitch-green/10 border border-pitch-green/20 px-2.5 py-1.5 rounded self-end md:self-center">
                      Bins Normal
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI sustainability recommendations */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#223d30]/40 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-pitch-green animate-pulse" size={16} />
              <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">AI Eco Nudge Recommendations</h3>
            </div>
          </div>

          <div className="flex-1 mt-4 space-y-4 text-xs leading-relaxed text-chalk/90">
            {state.zones.some(z => z.sustainability.wasteBinFill > 75) ? (
              <div className="p-3 bg-card-amber/15 border border-card-amber/20 rounded-xl space-y-2 text-card-amber">
                <h5 className="font-bold font-mono uppercase text-[9px] flex items-center gap-1">
                  <AlertTriangle size={12} /> Bin cluster near threshold
                </h5>
                <p>
                  Waste fill sensors in {state.zones.find(z => z.sustainability.wasteBinFill > 75)?.name} indicate bin clusters at 88%. Cleaning stewards are dispatched. Suggest updating mobile fans app alerts to suggest compostables drop.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-pitch-green/10 border border-pitch-green/20 rounded-xl space-y-2 text-pitch-green">
                <h5 className="font-bold font-mono uppercase text-[9px]">Eco-Sensors Operating</h5>
                <p>All waste zones reporting parameters within normal safety parameters. Energy grid utilizing 42% renewable solar canopy.</p>
              </div>
            )}

            <div className="p-3.5 bg-pitch-night/50 border border-[#223d30]/30 rounded-xl space-y-2">
              <h5 className="font-bold font-mono uppercase text-[9px] text-[#8a9894]">Carbon Offset Forecast</h5>
              <p className="text-[#8a9894]">
                Light rail integrations have decreased parking lot demand by 14%. Fan eco transit tracking has successfully saved approximately 1,420kg of CO2 today.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-pitch-night/30 border border-[#223d30]/20 rounded-lg flex gap-2">
            <Info size={16} className="text-pitch-green shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#8a9894]">
              Independent mock data sensors. Simulated telemetry tracks waste bin fills and local energy grid distribution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
