"use client";

import React, { useEffect, useRef } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import LiveStat from "@/components/shared/LiveStat";
import { Users, Info, TrendingUp, AlertTriangle } from "lucide-react";

export default function OpsCrowd() {
  const { state } = useTelemetry();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw simulated crowd particle animation on canvas based on zone densities
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; color: string }> = [];

    // Define 4 quadrant zone centers
    const zoneCenters = [
      { name: "Concourse A", x: 100, y: 100, density: state.zones[0]?.density || 30, color: "rgba(46, 139, 79, " },
      { name: "Concourse B", x: 300, y: 100, density: state.zones[1]?.density || 30, color: "rgba(245, 184, 65, " },
      { name: "Concourse C", x: 300, y: 300, density: state.zones[2]?.density || 30, color: "rgba(232, 72, 58, " },
      { name: "Concourse D", x: 100, y: 300, density: state.zones[3]?.density || 30, color: "rgba(232, 72, 58, " }
    ];

    // Seed particles proportionally to density
    zoneCenters.forEach((zc) => {
      const count = Math.round(zc.density / 2);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: zc.x + (Math.random() * 80 - 40),
          y: zc.y + (Math.random() * 80 - 40),
          vx: Math.random() * 0.4 - 0.2,
          vy: Math.random() * 0.4 - 0.2,
          color: zc.color
        });
      }
    });

    const animate = () => {
      ctx.fillStyle = "#0c1a15";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw zone boundaries/grid
      ctx.strokeStyle = "rgba(34, 61, 48, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw Zone text tags
      ctx.fillStyle = "rgba(138, 152, 148, 0.6)";
      ctx.font = "10px monospace";
      ctx.fillText("ZONE A (NORTH)", 10, 20);
      ctx.fillText("ZONE B (EAST)", 220, 20);
      ctx.fillText("ZONE C (SOUTH)", 220, 220);
      ctx.fillText("ZONE D (WEST)", 10, 220);

      // Draw heatmap glows
      zoneCenters.forEach((zc) => {
        const radius = zc.density * 0.8;
        const gradient = ctx.createRadialGradient(zc.x, zc.y, 5, zc.x, zc.y, radius);
        
        let opacity = 0.15;
        let colorStr = "46, 139, 79"; // green
        if (zc.density > 75) {
          colorStr = "232, 72, 58"; // red
          opacity = 0.3;
        } else if (zc.density > 50) {
          colorStr = "245, 184, 65"; // yellow
          opacity = 0.2;
        }

        gradient.addColorStop(0, `rgba(${colorStr}, ${opacity})`);
        gradient.addColorStop(1, "rgba(12, 26, 21, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(zc.x, zc.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce within screen bounds
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = p.color + " 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [state.zones]);

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Grid Column: 2D Live Canvas Heatmap */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#223d30]/40 pb-3">
            <div className="flex items-center gap-2">
              <Users className="text-pitch-green" size={16} />
              <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Live Concourse Heatmap Overlay</h3>
            </div>
            <span className="text-[10px] text-[#8a9894] font-mono uppercase">Telemetry Sensor nodes active</span>
          </div>

          {/* Canvas Render viewport */}
          <div className="flex-1 flex items-center justify-center py-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="bg-[#0c1a15] rounded-xl border border-[#223d30]/40 w-full max-w-[400px] h-[400px] shadow-inner"
            />
          </div>

          <div className="p-3 bg-pitch-night/50 border border-pitch-green/20 rounded-lg flex gap-2">
            <Info size={16} className="text-pitch-green shrink-0 mt-0.5" />
            <p className="text-xs text-[#8a9894]">
              Each particle represents a cluster of match spectators. Glow overlays denote regional density checks. High density areas trigger dispatch indicators inside Volunteer Comms.
            </p>
          </div>
        </div>

        {/* Right Grid Column: Congestion forecast list */}
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-[#223d30]/40 pb-3">
            <TrendingUp className="text-pitch-green" size={16} />
            <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Predictive Congestion Forecast</h3>
          </div>

          <div className="flex-1 mt-4 space-y-4">
            {state.zones.map((zone) => {
              // Predict congestion behavior based on match phase
              let predictionText = "Stable influx, crowds dispersing.";
              let trendClass = "text-pitch-green";
              let riskLevel: "Low" | "Medium" | "High" = "Low";

              if (zone.density > 75) {
                predictionText = "Approaching critical safety limit. Reroute required.";
                trendClass = "text-card-red font-bold";
                riskLevel = "High";
              } else if (zone.density > 50) {
                predictionText = "Congestion forming. Monitor gate exits.";
                trendClass = "text-card-amber";
                riskLevel = "Medium";
              }

              return (
                <div key={zone.id} className="p-3.5 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-chalk font-semibold">{zone.name.split(" ")[0]} {zone.name.split(" ")[1] || ""}</span>
                    <span className={trendClass}>{zone.density}% Density</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <div className="bg-surface p-1.5 rounded border border-[#223d30]/10 text-center">
                      <span className="text-[#8a9894] block">ETA +30m</span>
                      <span className="text-chalk font-bold">
                        {Math.min(99, Math.round(zone.density * 1.15))}%
                      </span>
                    </div>
                    <div className="bg-surface p-1.5 rounded border border-[#223d30]/10 text-center">
                      <span className="text-[#8a9894] block">ETA +60m</span>
                      <span className="text-chalk font-bold">
                        {Math.min(99, Math.round(zone.density * 1.3))}%
                      </span>
                    </div>
                    <div className="bg-surface p-1.5 rounded border border-[#223d30]/10 text-center">
                      <span className="text-[#8a9894] block">Risk Level</span>
                      <span className={`${trendClass} font-bold`}>{riskLevel}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8a9894] italic">{predictionText}</p>
                </div>
              );
            })}
          </div>

          {state.zones.some(z => z.density > 75) && (
            <div className="mt-4 p-3 bg-card-red/10 border border-card-red/30 rounded-lg text-card-red text-xs flex gap-2 items-center">
              <AlertTriangle size={16} />
              <span><strong>Action Suggested:</strong> High crowd warnings are active in Concourse D. Direct stewards to deploy bypass barriers.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
