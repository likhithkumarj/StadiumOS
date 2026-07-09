"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { findShortestPath, NODES, GraphNode } from "@/lib/simulationEngine";
import LiveStat from "@/components/shared/LiveStat";
import { MapPin, Navigation, Info, ShieldAlert, Star } from "lucide-react";

export default function FanNavigate() {
  const { state, wheelchairMode } = useTelemetry();
  const [startNode, setStartNode] = useState("rail-station");
  const [endNode, setEndNode] = useState("zone-3");
  const [routeResult, setRouteResult] = useState<any>(null);

  const transitNodes = NODES.filter(n => n.type === "transit");
  const zoneNodes = NODES.filter(n => n.type === "zone");

  const calculateRoute = () => {
    const res = findShortestPath(startNode, endNode, wheelchairMode, state.gates);
    setRouteResult(res);
  };

  // Helper to color-code gates for SVG representation
  const getGateColorClass = (gateId: string) => {
    const gate = state.gates.find(g => g.id === gateId);
    if (!gate) return "fill-gray-600";
    if (gate.status === "closed") return "fill-card-red stroke-red-800 animate-pulse";
    if (gate.status === "critical") return "fill-card-red";
    if (gate.status === "caution") return "fill-card-amber";
    return "fill-pitch-green";
  };

  // Coordinate map for nodes to draw SVG dots and paths
  const NODE_COORDINATES: { [id: string]: { x: number; y: number } } = {
    // Transits
    "rail-station": { x: 60, y: 60 },
    "bus-station": { x: 340, y: 60 },
    "shuttle-stop": { x: 200, y: 380 },
    "east-boulevard": { x: 340, y: 340 },
    // Gates
    "gate-1": { x: 200, y: 70 }, // North
    "gate-2": { x: 292, y: 108 }, // Northeast
    "gate-3": { x: 330, y: 200 }, // East
    "gate-4": { x: 292, y: 292 }, // Southeast
    "gate-5": { x: 200, y: 330 }, // South
    "gate-6": { x: 108, y: 292 }, // Southwest
    // Concourses
    "concourse-a": { x: 200, y: 110 },
    "concourse-b": { x: 290, y: 200 },
    "concourse-c": { x: 200, y: 290 },
    "concourse-d": { x: 110, y: 200 },
    // Zones
    "zone-1": { x: 200, y: 150 },
    "zone-2": { x: 250, y: 200 },
    "zone-3": { x: 200, y: 250 },
    "zone-4": { x: 150, y: 200 }
  };

  const startCoord = NODE_COORDINATES[startNode];
  
  // Gate references for displaying live queues on the map
  const g1 = state.gates.find(g => g.id === "gate-1");
  const g2 = state.gates.find(g => g.id === "gate-2");
  const g3 = state.gates.find(g => g.id === "gate-3");
  const g4 = state.gates.find(g => g.id === "gate-4");
  const g5 = state.gates.find(g => g.id === "gate-5");
  const g6 = state.gates.find(g => g.id === "gate-6");

  return (
    <div className="space-y-4">
      {/* Route Selector Panel */}
      <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 space-y-3">
        <h3 className="text-xs text-[#8a9894] font-mono uppercase tracking-wider flex items-center gap-1.5">
          <Navigation size={14} className="text-pitch-green" /> Seat Wayfinder Routing
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[#8a9894] mb-1 font-mono text-[9px] uppercase">Current Location</label>
            <select 
              value={startNode} 
              onChange={(e) => setStartNode(e.target.value)}
              className="w-full bg-pitch-night border border-[#223d30]/60 text-chalk p-2 rounded-lg focus:outline-none"
            >
              <optgroup label="Transit Terminals">
                {transitNodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </optgroup>
              <optgroup label="Stadium Gates">
                {state.gates.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[#8a9894] mb-1 font-mono text-[9px] uppercase">Target Seating Zone</label>
            <select 
              value={endNode} 
              onChange={(e) => setEndNode(e.target.value)}
              className="w-full bg-pitch-night border border-[#223d30]/60 text-chalk p-2 rounded-lg focus:outline-none"
            >
              {zoneNodes.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={calculateRoute}
          className="w-full bg-pitch-green text-pitch-night font-bold uppercase tracking-wider text-xs py-2.5 rounded-lg hover:bg-opacity-90 active:scale-98 transition-all"
        >
          Compute Smart Route
        </button>
      </div>

      {/* Interactive 2D SVG Stadium Map */}
      <div className="bg-surface rounded-xl p-3 border border-[#223d30]/40 flex flex-col items-center">
        <div className="w-full flex items-center justify-between text-[9px] font-mono text-[#8a9894] mb-2 uppercase">
          <span>Venue Map Telemetry overlay</span>
          <div className="flex gap-2">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pitch-green"></span> Clear</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-card-amber"></span> Caution</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-card-red"></span> Alert</span>
          </div>
        </div>

        {/* 2D Stadium Map Drawing */}
        <div className="bg-[#050b09] w-full rounded-lg border border-[#223d30]/20 flex justify-center p-2 relative overflow-hidden">
          <svg viewBox="0 0 400 400" className="w-full max-w-[340px] h-[340px]">
            {/* SVG Defs for Glow Filters and Gradients */}
            <defs>
              <filter id="map-path-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="pitch-field-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e462f" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0d2418" stopOpacity="0.9" />
              </radialGradient>
            </defs>

            {/* Stadium Grid Overlay background */}
            <g opacity="0.06" stroke="#2e8b4f" strokeWidth="0.5">
              <line x1="50" y1="0" x2="50" y2="400" />
              <line x1="100" y1="0" x2="100" y2="400" />
              <line x1="150" y1="0" x2="150" y2="400" />
              <line x1="200" y1="0" x2="200" y2="400" />
              <line x1="250" y1="0" x2="250" y2="400" />
              <line x1="300" y1="0" x2="300" y2="400" />
              <line x1="350" y1="0" x2="350" y2="400" />
              <line x1="0" y1="50" x2="400" y2="50" />
              <line x1="0" y1="100" x2="400" y2="100" />
              <line x1="0" y1="150" x2="400" y2="150" />
              <line x1="0" y1="200" x2="400" y2="200" />
              <line x1="0" y1="250" x2="400" y2="250" />
              <line x1="0" y1="300" x2="400" y2="300" />
              <line x1="0" y1="350" x2="400" y2="350" />
            </g>

            {/* Outer Perimeter Boundary */}
            <circle cx="200" cy="200" r="160" className="fill-none stroke-[#223d30]/20 stroke-1" />
            <circle cx="200" cy="200" r="130" className="fill-none stroke-[#223d30]/30 stroke-1 stroke-dasharray-[3,3]" />

            {/* Concourse Walkway Ring */}
            <circle cx="200" cy="200" r="100" className="fill-none stroke-[#152a21]/60 stroke-[10px]" />
            <circle cx="200" cy="200" r="95" className="fill-none stroke-[#223d30]/30 stroke-0.5" />
            <circle cx="200" cy="200" r="105" className="fill-none stroke-[#223d30]/30 stroke-0.5" />

            {/* Seating stands tiers concentric circles */}
            <circle cx="200" cy="200" r="82" className="fill-none stroke-[#223d30]/50 stroke-1 stroke-dasharray-[1,2]" />
            <circle cx="200" cy="200" r="74" className="fill-none stroke-[#223d30]/50 stroke-1 stroke-dasharray-[1,2]" />
            <circle cx="200" cy="200" r="66" className="fill-none stroke-[#223d30]/50 stroke-1 stroke-dasharray-[1,2]" />
            <circle cx="200" cy="200" r="58" className="fill-none stroke-[#223d30]/50 stroke-1 stroke-dasharray-[1,2]" />

            {/* Seating bowl Sector Divider Aisles */}
            <line x1="200" y1="200" x2="135" y2="135" stroke="#050b09" strokeWidth="2.5" />
            <line x1="200" y1="200" x2="265" y2="135" stroke="#050b09" strokeWidth="2.5" />
            <line x1="200" y1="200" x2="265" y2="265" stroke="#050b09" strokeWidth="2.5" />
            <line x1="200" y1="200" x2="135" y2="265" stroke="#050b09" strokeWidth="2.5" />

            {/* Center Football Pitch */}
            <g transform="translate(0, 0)">
              <rect x="178" y="168" width="44" height="64" rx="2" fill="url(#pitch-field-grad)" stroke="#2e8b4f" strokeWidth="0.8" />
              <line x1="178" y1="200" x2="222" y2="200" stroke="#2e8b4f" strokeWidth="0.5" opacity="0.6" />
              <circle cx="200" cy="200" r="10" fill="none" stroke="#2e8b4f" strokeWidth="0.5" opacity="0.6" />
              {/* Penalty boxes */}
              <rect x="187" y="168" width="26" height="12" fill="none" stroke="#2e8b4f" strokeWidth="0.5" opacity="0.6" />
              <rect x="187" y="220" width="26" height="12" fill="none" stroke="#2e8b4f" strokeWidth="0.5" opacity="0.6" />
            </g>

            {/* Draw Shortest Path glow overlay */}
            {routeResult && routeResult.path && (
              <path
                d={routeResult.path.map((nodeId: string, idx: number) => {
                  const coord = NODE_COORDINATES[nodeId];
                  return `${idx === 0 ? "M" : "L"} ${coord.x} ${coord.y}`;
                }).join(" ")}
                className="fill-none stroke-pitch-green stroke-[4px] stroke-linecap-round stroke-linejoin-round animate-[dash_2.5s_linear_infinite]"
                style={{ strokeDasharray: "12, 6" }}
                filter="url(#map-path-glow)"
              />
            )}

            {/* Transit Terminals */}
            {/* Rail Station (Top Left) */}
            <g transform="translate(60, 60)">
              <rect x="-18" y="-7" width="36" height="14" rx="3" className="fill-[#0c1e2b] stroke-blue-500 stroke-1" />
              <text y="3" className="fill-blue-400 font-mono text-[7px] font-bold text-anchor-middle">RAIL</text>
            </g>
            {/* Bus Station (Top Right) */}
            <g transform="translate(340, 60)">
              <rect x="-18" y="-7" width="36" height="14" rx="3" className="fill-[#0c1e2b] stroke-blue-500 stroke-1" />
              <text y="3" className="fill-blue-400 font-mono text-[7px] font-bold text-anchor-middle">BUS</text>
            </g>
            {/* Shuttle Stop (Bottom Center) */}
            <g transform="translate(200, 380)">
              <rect x="-24" y="-7" width="48" height="14" rx="3" className="fill-[#0c1e2b] stroke-blue-500 stroke-1" />
              <text y="3" className="fill-blue-400 font-mono text-[7px] font-bold text-anchor-middle">SHUTTLE</text>
            </g>
            {/* East Boulevard (Bottom Right) */}
            <g transform="translate(340, 340)">
              <rect x="-18" y="-7" width="36" height="14" rx="3" className="fill-[#0c1e2b] stroke-blue-500 stroke-1" />
              <text y="3" className="fill-blue-400 font-mono text-[7px] font-bold text-anchor-middle">WALK</text>
            </g>

            {/* Inner Seating Zone coordinates labels */}
            <circle cx="200" cy="150" r="8" className="fill-chalk/10 stroke-[#8a9894]/40" />
            <text x="200" y="153" className="fill-chalk font-display text-[8px] text-anchor-middle font-bold">Z1</text>

            <circle cx="250" cy="200" r="8" className="fill-chalk/10 stroke-[#8a9894]/40" />
            <text x="250" y="203" className="fill-chalk font-display text-[8px] text-anchor-middle font-bold">Z2</text>

            <circle cx="200" cy="250" r="8" className="fill-chalk/10 stroke-[#8a9894]/40" />
            <text x="200" y="253" className="fill-chalk font-display text-[8px] text-anchor-middle font-bold">Z3</text>

            <circle cx="150" cy="200" r="8" className="fill-chalk/10 stroke-[#8a9894]/40" />
            <text x="150" y="203" className="fill-chalk font-display text-[8px] text-anchor-middle font-bold">Z4</text>

            {/* Draw Gates with Live Queue Badges */}
            {/* Gate 1 */}
            <g transform="translate(200, 70)">
              <circle r="9" className={getGateColorClass("gate-1") + " stroke-pitch-night stroke-1 cursor-pointer"} />
              <text y="3.5" className="fill-pitch-night font-mono font-bold text-[8px] text-anchor-middle">G1</text>
              {g1 && g1.status !== "closed" && (
                <g transform="translate(0, -14)">
                  <rect x="-11" y="-5" width="22" height="9" rx="1.5" className="fill-pitch-night stroke-[#223d30]/60 stroke-0.5" />
                  <text y="2" className="fill-chalk font-mono text-[6.5px] font-semibold text-anchor-middle">{g1.queueTime}m</text>
                </g>
              )}
            </g>

            {/* Gate 2 */}
            <g transform="translate(292, 108)">
              <circle r="9" className={getGateColorClass("gate-2") + " stroke-pitch-night stroke-1 cursor-pointer"} />
              <text y="3.5" className="fill-pitch-night font-mono font-bold text-[8px] text-anchor-middle">G2</text>
              {g2 && g2.status !== "closed" && (
                <g transform="translate(14, -8)">
                  <rect x="-11" y="-5" width="22" height="9" rx="1.5" className="fill-pitch-night stroke-[#223d30]/60 stroke-0.5" />
                  <text y="2" className="fill-chalk font-mono text-[6.5px] font-semibold text-anchor-middle">{g2.queueTime}m</text>
                </g>
              )}
            </g>

            {/* Gate 3 */}
            <g transform="translate(330, 200)">
              <circle r="9" className={getGateColorClass("gate-3") + " stroke-pitch-night stroke-1 cursor-pointer"} />
              <text y="3.5" className="fill-pitch-night font-mono font-bold text-[8px] text-anchor-middle">G3</text>
              {g3 && g3.status !== "closed" && (
                <g transform="translate(15, 0)">
                  <rect x="-11" y="-5" width="22" height="9" rx="1.5" className="fill-pitch-night stroke-[#223d30]/60 stroke-0.5" />
                  <text y="2" className="fill-chalk font-mono text-[6.5px] font-semibold text-anchor-middle">{g3.queueTime}m</text>
                </g>
              )}
            </g>

            {/* Gate 4 */}
            <g transform="translate(292, 292)">
              <circle r="9" className={getGateColorClass("gate-4") + " stroke-pitch-night stroke-1 cursor-pointer"} />
              <text y="3.5" className="fill-pitch-night font-mono font-bold text-[8px] text-anchor-middle">G4</text>
              {g4 && g4.status !== "closed" && (
                <g transform="translate(14, 8)">
                  <rect x="-11" y="-5" width="22" height="9" rx="1.5" className="fill-pitch-night stroke-[#223d30]/60 stroke-0.5" />
                  <text y="2" className="fill-chalk font-mono text-[6.5px] font-semibold text-anchor-middle">{g4.queueTime}m</text>
                </g>
              )}
            </g>

            {/* Gate 5 */}
            <g transform="translate(200, 330)">
              <circle r="9" className={getGateColorClass("gate-5") + " stroke-pitch-night stroke-1 cursor-pointer"} />
              <text y="3.5" className="fill-pitch-night font-mono font-bold text-[8px] text-anchor-middle">G5</text>
              {g5 && g5.status !== "closed" && (
                <g transform="translate(0, 14)">
                  <rect x="-11" y="-5" width="22" height="9" rx="1.5" className="fill-pitch-night stroke-[#223d30]/60 stroke-0.5" />
                  <text y="2" className="fill-chalk font-mono text-[6.5px] font-semibold text-anchor-middle">{g5.queueTime}m</text>
                </g>
              )}
            </g>

            {/* Gate 6 */}
            <g transform="translate(108, 292)">
              <circle r="9" className={getGateColorClass("gate-6") + " stroke-pitch-night stroke-1 cursor-pointer"} />
              <text y="3.5" className="fill-pitch-night font-mono font-bold text-[8px] text-anchor-middle">G6</text>
              {g6 && g6.status !== "closed" && (
                <g transform="translate(-14, 8)">
                  <rect x="-11" y="-5" width="22" height="9" rx="1.5" className="fill-pitch-night stroke-[#223d30]/60 stroke-0.5" />
                  <text y="2" className="fill-chalk font-mono text-[6.5px] font-semibold text-anchor-middle">{g6.queueTime}m</text>
                </g>
              )}
            </g>

            {/* Glowing "YOU ARE HERE" pin marker */}
            {startCoord && (
              <g className="transition-all duration-300">
                <circle cx={startCoord.x} cy={startCoord.y} r="15" className="fill-none stroke-pitch-green stroke-2 animate-ping" />
                <circle cx={startCoord.x} cy={startCoord.y} r="5" className="fill-pitch-green stroke-pitch-night stroke-1 animate-pulse" />
                <g transform={`translate(${startCoord.x}, ${startCoord.y - 12})`}>
                  <rect x="-14" y="-10" width="28" height="12" rx="3" className="fill-pitch-green stroke-pitch-night stroke-1 shadow-md" />
                  <text x="0" y="-2" className="fill-pitch-night font-mono font-bold text-[7px] text-anchor-middle">YOU</text>
                  <polygon points="0,2 -3,-1 3,-1" className="fill-pitch-green" />
                </g>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Path Results Panel */}
      {routeResult ? (
        <div className="bg-surface rounded-xl p-4 border border-[#223d30]/40 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#223d30]/50 pb-2">
            <span className="text-xs text-[#8a9894] font-mono uppercase">Total Travel ETA</span>
            <div className="bg-[#0b1713] px-3 py-1 rounded border border-[#223d30]/30 flex items-baseline gap-1">
              <LiveStat value={routeResult.totalTime} className="text-xl text-pitch-green font-bold" />
              <span className="text-xs text-[#8a9894]">mins</span>
            </div>
          </div>

          {/* AI Narration */}
          <div className="p-3 bg-pitch-night/50 border border-pitch-green/20 rounded-lg flex gap-2">
            <Info size={16} className="text-pitch-green shrink-0 mt-0.5" />
            <p className="text-xs text-chalk">
              <span className="text-pitch-green font-bold">AI Companion Route Narrative:</span> Take the route starting from the{" "}
              {NODES.find(n => n.id === startNode)?.name} passing through your designated entry check. Estimated gate check-in time is included. Total walk and wait time is approximately{" "}
              <strong>{routeResult.totalTime} minutes</strong>.
            </p>
          </div>

          {/* Accessibility warnings */}
          {routeResult.hasAccessibilityAlert && (
            <div className="p-3 bg-card-amber/15 border border-card-amber/30 rounded-lg text-card-amber flex gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs">
                <strong>Accessibility Alert:</strong> This route includes stairs. To avoid stairs, toggle Wheelchair-Optimized Route in the Access tab.
              </p>
            </div>
          )}

          {/* Route Steps */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-[#8a9894] font-mono uppercase">Step-by-Step Directions</h4>
            <div className="space-y-1 bg-[#0c1a15]/30 p-2 rounded-lg border border-[#223d30]/10">
              {routeResult.steps.map((step: string, idx: number) => (
                <div key={idx} className="text-xs flex items-center gap-2 py-0.5 text-chalk/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-pitch-green" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface/30 rounded-xl p-6 border border-[#223d30]/15 text-center text-xs text-[#8a9894]">
          Choose locations and click **Compute Smart Route** to display wayfinding coordinates and travel itinerary.
        </div>
      )}
    </div>
  );
}
