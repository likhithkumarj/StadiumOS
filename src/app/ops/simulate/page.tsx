"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { runFlowSimulation } from "@/lib/simulationEngine";
import LiveStat from "@/components/shared/LiveStat";
import { Activity, ShieldAlert, Sparkles, RefreshCw, BarChart2, Info } from "lucide-react";

export default function OpsSimulate() {
  const { state, role } = useTelemetry();
  const [selectedScenario, setSelectedScenario] = useState("close-gate-4");
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [aiNarrative, setAiNarrative] = useState("");

  const isReadOnly = role === "volunteer";

  const handleSimulate = async () => {
    setLoading(true);
    setAiNarrative("");
    
    let resultMetrics: any = {
      congestionDelta: 0,
      newQueues: {},
      weather: state.weather
    };

    let title = "Close Gate 4";

    if (selectedScenario === "close-gate-4") {
      title = "Emergency Gate 4 Turnstile Shutdown";
      // Deterministic flow simulation
      const res = runFlowSimulation("gate-4", state.gates);
      resultMetrics.congestionDelta = res.congestionDelta;
      // Map new queues
      state.gates.forEach(g => {
        resultMetrics.newQueues[g.name] = res.newQueues[g.id];
      });
    } else if (selectedScenario === "rainstorm") {
      title = "Flash Rain Storm During Arrival";
      resultMetrics.congestionDelta = 32;
      resultMetrics.weather = "Raining";
      state.gates.forEach(g => {
        resultMetrics.newQueues[g.name] = g.status === "closed" ? 0 : Math.min(45, g.queueTime + 12);
      });
    } else {
      title = "Spectator Entry Surge Second-Half";
      resultMetrics.congestionDelta = 48;
      state.gates.forEach(g => {
        resultMetrics.newQueues[g.name] = g.status === "closed" ? 0 : Math.min(45, g.queueTime + 15);
      });
    }

    setSimulationResult(resultMetrics);

    // Call server-side RAG narrator
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: title,
          computedMetrics: resultMetrics
        })
      });

      if (!response.ok) throw new Error("Simulation narration failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let currentText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        currentText += chunk;
        setAiNarrative(currentText);
      }
    } catch (e) {
      console.error(e);
      setAiNarrative("Operational narration failed. Check Gemini API configurations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Selector Card */}
      <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Activity className="text-pitch-green" size={16} />
            <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Recalculate Network Flow Simulator</h3>
          </div>
          <p className="text-xs text-[#8a9894] leading-relaxed">
            Select a critical match day anomaly to trigger deterministic path rerouting and queue displacement flows.
          </p>

          <div className="max-w-md pt-2">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full bg-[#0b1713] border border-[#223d30]/60 text-chalk text-xs font-mono p-2.5 rounded-lg focus:outline-none"
            >
              <option value="close-gate-4">Scenario A: Gate 4 turnstiles offline</option>
              <option value="rainstorm">Scenario B: Sudden rainstorm (increases security inspection time)</option>
              <option value="surge">Scenario C: Sudden surge at southwest gates</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading || isReadOnly}
          className="bg-pitch-green text-pitch-night font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-lg hover:bg-opacity-90 active:scale-98 disabled:opacity-30 transition-all flex items-center gap-2"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
          <span>Run Simulation</span>
        </button>
      </div>

      {/* Grid Results: Simulation metrics vs AI Narration */}
      {simulationResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation outputs */}
          <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 lg:col-span-1 space-y-4 flex flex-col">
            <div className="flex items-center gap-2 border-b border-[#223d30]/40 pb-3">
              <BarChart2 className="text-pitch-green" size={16} />
              <h4 className="text-xs font-mono uppercase tracking-wider text-chalk">Recalculated Queues</h4>
            </div>

            <div className="flex-1 flex flex-col justify-around gap-3">
              <div className="p-3 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl flex items-center justify-between">
                <span className="text-[10px] text-[#8a9894] uppercase tracking-wider font-mono">Congestion Delta</span>
                <div className="flex items-baseline gap-0.5">
                  <LiveStat
                    value={`${simulationResult.congestionDelta > 0 ? "+" : ""}${simulationResult.congestionDelta}`}
                    className={`text-xl font-bold ${simulationResult.congestionDelta > 0 ? "text-card-red" : "text-pitch-green"}`}
                  />
                  <span className="text-xs text-[#8a9894] font-mono">%</span>
                </div>
              </div>

              {Object.keys(simulationResult.newQueues).map((gateName) => (
                <div key={gateName} className="flex items-center justify-between text-xs font-mono p-1 border-b border-[#223d30]/10">
                  <span className="text-[#8a9894]">{gateName}</span>
                  <span className="text-chalk font-semibold">{simulationResult.newQueues[gateName]} mins</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Narrator Briefing */}
          <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between border-b border-[#223d30]/40 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-pitch-green animate-pulse" size={16} />
                <h4 className="text-xs font-mono uppercase tracking-wider text-chalk">AI Command Copilot narrative briefing</h4>
              </div>
              <span className="text-[9px] font-mono text-pitch-green uppercase bg-pitch-green/10 border border-pitch-green/20 px-2 py-0.5 rounded">
                AI Suggestion
              </span>
            </div>

            <div className="flex-1 mt-4 p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl overflow-y-auto max-h-[340px] text-xs leading-relaxed text-chalk/90 prose prose-invert font-sans space-y-3 whitespace-pre-line">
              {aiNarrative ? (
                aiNarrative
              ) : (
                <div className="flex items-center gap-2 text-[#8a9894] font-mono animate-pulse">
                  <RefreshCw size={14} className="animate-spin text-pitch-green" />
                  Generating operational narrative briefing...
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-surface border border-[#223d30]/40 rounded-lg flex gap-2">
              <Info size={16} className="text-pitch-green shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#8a9894]">
                This action is an operational simulation. Click **Broadcast Update** inside Comms Studio to dispatch instructions to volunteer groups.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface/30 rounded-2xl p-8 border border-[#223d30]/15 text-center text-xs text-[#8a9894] font-mono">
          Ready to run network simulation. Choose preset and click **Run Simulation**.
        </div>
      )}
    </div>
  );
}
