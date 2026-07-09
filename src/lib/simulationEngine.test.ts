import { describe, it, expect } from "vitest";
import { findShortestPath, runFlowSimulation } from "./simulationEngine";
import { createInitialState } from "../data/mockTelemetry";

describe("simulationEngine unit tests", () => {
  const mockState = createInitialState("Los Angeles Stadium");

  it("calculates shortest path correctly", () => {
    // Path from rail-station to zone-1
    const res = findShortestPath("rail-station", "zone-1", false, mockState.gates);
    expect(res).not.toBeNull();
    if (res) {
      expect(res.path).toContain("gate-1");
      expect(res.totalTime).toBeGreaterThan(0);
      expect(res.steps.length).toBeGreaterThan(0);
    }
  });

  it("wheelchair mode routing bypasses stairs", () => {
    // Path from rail-station to zone-2 has stairs on rail-station -> gate-2 and concourse-a -> zone-2.
    // In wheelchair mode, it must find a longer but step-free path.
    const resNormal = findShortestPath("rail-station", "zone-2", false, mockState.gates);
    const resWheelchair = findShortestPath("rail-station", "zone-2", true, mockState.gates);

    expect(resNormal).not.toBeNull();
    expect(resWheelchair).not.toBeNull();
    
    if (resNormal && resWheelchair) {
      expect(resNormal.hasAccessibilityAlert).toBe(true);
      expect(resWheelchair.hasAccessibilityAlert).toBe(false);
      // Accessible route should have different nodes or take longer
      expect(resWheelchair.totalTime).toBeGreaterThanOrEqual(resNormal.totalTime);
    }
  });

  it("re-routes flow correctly when a gate is closed", () => {
    const res = runFlowSimulation("gate-4", mockState.gates);
    // Gate 4 queue should drop to 0
    expect(res.newQueues["gate-4"]).toBe(0);
    // Gate 3 & 5 (adjacent gates) should increase in wait times
    expect(res.newQueues["gate-3"]).toBeGreaterThan(mockState.gates.find(g => g.id === "gate-3")!.queueTime);
    expect(res.newQueues["gate-5"]).toBeGreaterThan(mockState.gates.find(g => g.id === "gate-5")!.queueTime);
    expect(res.congestionDelta).toBeGreaterThan(0);
  });
});
