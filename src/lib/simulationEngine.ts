import { Gate, TelemetryState } from "../data/mockTelemetry";

export interface GraphNode {
  id: string;
  name: string;
  type: "transit" | "gate" | "concourse" | "zone";
}

export interface GraphEdge {
  from: string;
  to: string;
  distance: number; // base walking time in minutes
  hasStairs: boolean; // accessibility flag
  baseCapacity: number; // people per minute capacity
}

// Nodes mapping
export const NODES: GraphNode[] = [
  // Transit entry points
  { id: "rail-station", name: "Light Rail Station", type: "transit" },
  { id: "bus-station", name: "Bus Terminal", type: "transit" },
  { id: "shuttle-stop", name: "Shuttle Terminal", type: "transit" },
  { id: "east-boulevard", name: "East Pedestrian Boulevard", type: "transit" },
  
  // Gates
  { id: "gate-1", name: "Gate 1 (North)", type: "gate" },
  { id: "gate-2", name: "Gate 2 (Northeast)", type: "gate" },
  { id: "gate-3", name: "Gate 3 (East)", type: "gate" },
  { id: "gate-4", name: "Gate 4 (Southeast)", type: "gate" },
  { id: "gate-5", name: "Gate 5 (South)", type: "gate" },
  { id: "gate-6", name: "Gate 6 (Southwest)", type: "gate" },
  
  // Concourses
  { id: "concourse-a", name: "Concourse A (North)", type: "concourse" },
  { id: "concourse-b", name: "Concourse B (East)", type: "concourse" },
  { id: "concourse-c", name: "Concourse C (Southeast)", type: "concourse" },
  { id: "concourse-d", name: "Concourse D (Southwest)", type: "concourse" },
  
  // Inner seating zones
  { id: "zone-1", name: "Seating Zone 1 (North Side)", type: "zone" },
  { id: "zone-2", name: "Seating Zone 2 (East Club)", type: "zone" },
  { id: "zone-3", name: "Seating Zone 3 (South Lower)", type: "zone" },
  { id: "zone-4", name: "Seating Zone 4 (West Upper)", type: "zone" }
];

// Bidirectional Edges mapping
export const EDGES: GraphEdge[] = [
  // Transit Hubs to Gates
  { from: "rail-station", to: "gate-1", distance: 4, hasStairs: false, baseCapacity: 150 },
  { from: "rail-station", to: "gate-2", distance: 6, hasStairs: true, baseCapacity: 100 }, // stairs here
  
  { from: "bus-station", to: "gate-3", distance: 3, hasStairs: false, baseCapacity: 120 },
  { from: "bus-station", to: "gate-4", distance: 5, hasStairs: false, baseCapacity: 110 },
  
  { from: "shuttle-stop", to: "gate-5", distance: 3, hasStairs: false, baseCapacity: 130 },
  { from: "east-boulevard", to: "gate-6", distance: 5, hasStairs: true, baseCapacity: 90 }, // stairs here
  
  // Interconnecting Gates
  { from: "gate-1", to: "gate-2", distance: 3, hasStairs: false, baseCapacity: 80 },
  { from: "gate-2", to: "gate-3", distance: 4, hasStairs: false, baseCapacity: 80 },
  { from: "gate-3", to: "gate-4", distance: 3, hasStairs: false, baseCapacity: 85 },
  { from: "gate-4", to: "gate-5", distance: 4, hasStairs: false, baseCapacity: 85 },
  { from: "gate-5", to: "gate-6", distance: 3, hasStairs: false, baseCapacity: 80 },
  { from: "gate-6", to: "gate-1", distance: 6, hasStairs: false, baseCapacity: 80 },
  
  // Gates to Concourses (connecting to the nearest concourse sector)
  { from: "gate-1", to: "concourse-a", distance: 2, hasStairs: false, baseCapacity: 160 },
  { from: "gate-2", to: "concourse-a", distance: 3, hasStairs: false, baseCapacity: 140 },
  
  { from: "gate-3", to: "concourse-b", distance: 2, hasStairs: false, baseCapacity: 140 },
  
  { from: "gate-4", to: "concourse-c", distance: 2, hasStairs: false, baseCapacity: 140 },
  
  { from: "gate-5", to: "concourse-c", distance: 2, hasStairs: false, baseCapacity: 150 }, // South gate to South concourse
  { from: "gate-6", to: "concourse-d", distance: 2, hasStairs: false, baseCapacity: 130 },
  
  // Interconnecting Concourses (Concourse Ring / Perimeter walkway loop)
  { from: "concourse-a", to: "concourse-b", distance: 4, hasStairs: false, baseCapacity: 150 },
  { from: "concourse-b", to: "concourse-c", distance: 4, hasStairs: false, baseCapacity: 150 },
  { from: "concourse-c", to: "concourse-d", distance: 4, hasStairs: false, baseCapacity: 150 },
  { from: "concourse-d", to: "concourse-a", distance: 4, hasStairs: false, baseCapacity: 150 },
  
  // Concourses to Inner Seating Zones (entering stand from nearest concourse)
  { from: "concourse-a", to: "zone-1", distance: 3, hasStairs: false, baseCapacity: 120 },
  
  // Zone 2 Stairs vs Elevator choice
  { from: "concourse-b", to: "zone-2", distance: 2, hasStairs: true, baseCapacity: 130 }, // standard stairs entry
  { from: "concourse-b", to: "zone-2", distance: 5, hasStairs: false, baseCapacity: 60 },  // accessible elevator entry
  
  { from: "concourse-c", to: "zone-3", distance: 2, hasStairs: false, baseCapacity: 140 },
  
  // Zone 4 Stairs vs Elevator choice
  { from: "concourse-d", to: "zone-4", distance: 3, hasStairs: true, baseCapacity: 90 },   // standard stairs entry
  { from: "concourse-d", to: "zone-4", distance: 6, hasStairs: false, baseCapacity: 50 }   // accessible elevator entry
];

export interface PathResult {
  path: string[];
  totalTime: number; // in minutes (walking time + queue times)
  steps: string[];
  hasAccessibilityAlert: boolean;
}

// Rerouting path calculations (Dijkstra)
export function findShortestPath(
  startId: string,
  endId: string,
  wheelchairMode: boolean,
  gatesTelemetry: Gate[]
): PathResult | null {
  // Construct adjacency list
  const adj: { [node: string]: GraphEdge[] } = {};
  for (const node of NODES) {
    adj[node.id] = [];
  }

  // Populate edges bi-directionally
  for (const edge of EDGES) {
    if (wheelchairMode && edge.hasStairs) continue; // skip stairs in wheelchair mode
    adj[edge.from].push(edge);
    // Reverse edge
    adj[edge.to].push({
      from: edge.to,
      to: edge.from,
      distance: edge.distance,
      hasStairs: edge.hasStairs,
      baseCapacity: edge.baseCapacity
    });
  }

  // Dijkstra's algorithm
  const distances: { [node: string]: number } = {};
  const previous: { [node: string]: string | null } = {};
  const queue: string[] = [];

  for (const node of NODES) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    queue.push(node.id);
  }

  distances[startId] = 0;

  while (queue.length > 0) {
    // Sort queue to find minimum distance
    queue.sort((a, b) => distances[a] - distances[b]);
    const u = queue.shift();

    if (!u || distances[u] === Infinity) break;
    if (u === endId) break;

    for (const neighborEdge of adj[u]) {
      const v = neighborEdge.to;
      if (!queue.includes(v)) continue;

      // Weight is edge walking distance
      let weight = neighborEdge.distance;

      // If the node we are traveling to is a gate, add its live queue time wait
      const targetNode = NODES.find(n => n.id === v);
      if (targetNode && targetNode.type === "gate") {
        const telemetryGate = gatesTelemetry.find(g => g.id === v);
        if (telemetryGate) {
          if (telemetryGate.status === "closed") {
            weight = Infinity; // closed gate is impassable
          } else {
            weight += telemetryGate.queueTime; // add queue time in minutes
          }
        }
      }

      const alt = distances[u] + weight;
      if (alt < distances[v]) {
        distances[v] = alt;
        previous[v] = u;
      }
    }
  }

  if (distances[endId] === Infinity) return null;

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  // Construct narration steps
  const steps: string[] = [];
  let hasAccessibilityAlert = false;

  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = NODES.find(n => n.id === path[i]);
    const toNode = NODES.find(n => n.id === path[i + 1]);
    const edgeUsed = EDGES.find(
      e => (e.from === path[i] && e.to === path[i + 1]) || (e.to === path[i] && e.from === path[i + 1])
    );

    if (edgeUsed?.hasStairs && !wheelchairMode) {
      hasAccessibilityAlert = true;
    }

    if (fromNode && toNode) {
      if (toNode.type === "gate") {
        const gateTel = gatesTelemetry.find(g => g.id === toNode.id);
        const queueTime = gateTel ? gateTel.queueTime : 0;
        steps.push(`Proceed to ${toNode.name} (${queueTime}m queue time)`);
      } else {
        steps.push(`Walk from ${fromNode.name} to ${toNode.name}`);
      }
    }
  }

  return {
    path,
    totalTime: Math.round(distances[endId]),
    steps,
    hasAccessibilityAlert
  };
}

// Real flow-network congestion modifier
export function runFlowSimulation(
  gateClosedId: string,
  gatesTelemetry: Gate[]
): {
  newQueues: { [gateId: string]: number };
  congestionDelta: number; // percentage change in average queue time
} {
  const activeGates = gatesTelemetry.filter(g => g.id !== gateClosedId && g.status !== "closed");
  const closedGate = gatesTelemetry.find(g => g.id === gateClosedId);
  
  if (!closedGate || activeGates.length === 0) {
    // Return unmodified
    const ret: { [gateId: string]: number } = {};
    gatesTelemetry.forEach(g => {
      ret[g.id] = g.queueTime;
    });
    return { newQueues: ret, congestionDelta: 0 };
  }

  // Re-distribute the closed gate's queue flow to adjacent gates
  // Let's assume adjacent gates are nearby gates (e.g. gates that are close in distance index)
  const sortedGates = [...gatesTelemetry];
  const closedIndex = sortedGates.findIndex(g => g.id === gateClosedId);

  // Find two adjacent gates in the circle
  const adjIndex1 = (closedIndex - 1 + sortedGates.length) % sortedGates.length;
  const adjIndex2 = (closedIndex + 1) % sortedGates.length;
  
  const adjGate1 = sortedGates[adjIndex1];
  const adjGate2 = sortedGates[adjIndex2];

  const newQueues: { [gateId: string]: number } = {};
  let totalPrevQueue = 0;
  let totalNewQueue = 0;

  gatesTelemetry.forEach(g => {
    totalPrevQueue += g.queueTime;
    if (g.id === gateClosedId) {
      newQueues[g.id] = 0;
    } else if (g.id === adjGate1.id || g.id === adjGate2.id) {
      // Split closed gate's current load
      const addedLoad = closedGate.queueTime * 0.7; // 70% increase split
      newQueues[g.id] = Math.min(45, Math.round(g.queueTime + addedLoad));
    } else {
      // Slight impact on other gates
      const addedLoad = closedGate.queueTime * 0.15;
      newQueues[g.id] = Math.min(45, Math.round(g.queueTime + addedLoad));
    }
    totalNewQueue += newQueues[g.id];
  });

  const delta = totalPrevQueue > 0 ? ((totalNewQueue - totalPrevQueue) / totalPrevQueue) * 100 : 0;

  return {
    newQueues,
    congestionDelta: Math.round(delta)
  };
}
