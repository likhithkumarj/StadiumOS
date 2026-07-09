import { describe, it, expect } from "vitest";
import {
  createInitialState,
  randomWalkTelemetry,
  applyRainScenario,
  applyGate4ClosureScenario,
  applySurgeScenario
} from "./mockTelemetry";

describe("mockTelemetry unit tests", () => {
  it("initializes state correctly", () => {
    const state = createInitialState("Miami Stadium");
    expect(state.currentVenue).toBe("Miami Stadium");
    expect(state.gates.length).toBe(6);
    expect(state.weather).toBe("Clear");
    expect(state.incidents.length).toBeGreaterThan(0);
  });

  it("random walk respects boundary rules", () => {
    let state = createInitialState("Toronto Stadium");
    // Run 5 random walks
    for (let i = 0; i < 5; i++) {
      state = randomWalkTelemetry(state);
    }
    // Verify gates remain valid
    state.gates.forEach(g => {
      expect(g.queueTime).toBeGreaterThanOrEqual(1);
      expect(g.queueTime).toBeLessThanOrEqual(45);
      expect(g.currentFlow).toBeGreaterThanOrEqual(20);
    });
    // Verify zone parameters
    state.zones.forEach(z => {
      expect(z.density).toBeGreaterThanOrEqual(5);
      expect(z.density).toBeLessThanOrEqual(99);
      expect(z.sustainability.wasteBinFill).toBeGreaterThanOrEqual(0);
      expect(z.sustainability.wasteBinFill).toBeLessThanOrEqual(100);
    });
  });

  it("applies rain storm metrics appropriately", () => {
    const initial = createInitialState("Dallas Stadium");
    const rainState = applyRainScenario(initial);

    expect(rainState.weather).toBe("Raining");
    expect(rainState.temperature).toBe(17);
    // Bumps queue times
    expect(rainState.gates[0].queueTime).toBeGreaterThan(initial.gates[0].queueTime);
    // Dispatches slippery incident
    expect(rainState.incidents.some(i => i.title.includes("Slippery"))).toBe(true);
  });
});
