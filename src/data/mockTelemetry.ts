"use client";

// Telemetry structures and types
export interface Gate {
  id: string;
  name: string;
  queueTime: number; // in minutes
  status: "normal" | "caution" | "critical" | "closed";
  capacity: number; // capacity in people per minute
  currentFlow: number; // current flow rate
}

export interface Zone {
  id: string;
  name: string;
  density: number; // in percent (0 - 100)
  temp: number; // in celsius
  noiseLevel: number; // in decibels
  sustainability: {
    wasteBinFill: number; // in percent
    energyUsage: number; // in kW
  };
}

export interface Incident {
  id: string;
  title: string;
  location: string;
  severity: "monitor" | "critical";
  status: "active" | "resolved";
  reportedTime: string;
  description: string;
  aiRecommendation?: string;
  approved?: boolean;
  dismissed?: boolean;
}

export interface TransitOption {
  id: string;
  name: string;
  type: "shuttle" | "bus" | "rail" | "walk";
  eta: number; // in minutes
  status: "normal" | "caution" | "delayed" | "critical";
  delayReason?: string;
  carbonSaved: number; // in kg CO2 compared to driving
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  status: "idle" | "active" | "break";
  assignedZone: string;
  currentTask?: string;
}

export interface TelemetryState {
  currentVenue: string;
  weather: "Clear" | "Overcast" | "Raining" | "Stormy";
  temperature: number;
  kickoffCountdown: number; // in seconds
  totalAttendance: number;
  matchScore: string;
  matchPhase: "pre-match" | "first-half" | "half-time" | "second-half" | "post-match";
  gates: Gate[];
  zones: Zone[];
  incidents: Incident[];
  transit: TransitOption[];
  volunteers: Volunteer[];
  sustainabilityTips: string[];
}

export const VENUES = [
  "Los Angeles Stadium",
  "Mexico City Stadium",
  "Miami Stadium",
  "Toronto Stadium",
  "Dallas Stadium",
  "Atlanta Stadium",
  "Seattle Stadium",
  "San Francisco Bay Area Stadium",
  "Houston Stadium",
  "Kansas City Stadium",
  "Boston Stadium",
  "Philadelphia Stadium",
  "New York New Jersey Stadium",
  "BC Place Vancouver",
  "Guadalajara Stadium",
  "Monterrey Stadium"
];

// Initial default state
export const createInitialState = (venueName: string = "Los Angeles Stadium"): TelemetryState => {
  return {
    currentVenue: venueName,
    weather: "Clear",
    temperature: 24,
    kickoffCountdown: 7200, // 2 hours
    totalAttendance: 64250,
    matchScore: "USA 0 - 0 ENG",
    matchPhase: "pre-match",
    gates: [
      { id: "gate-1", name: "Gate 1 (North)", queueTime: 4, status: "normal", capacity: 150, currentFlow: 45 },
      { id: "gate-2", name: "Gate 2 (Northeast)", queueTime: 8, status: "normal", capacity: 120, currentFlow: 60 },
      { id: "gate-3", name: "Gate 3 (East)", queueTime: 12, status: "caution", capacity: 100, currentFlow: 80 },
      { id: "gate-4", name: "Gate 4 (Southeast)", queueTime: 7, status: "normal", capacity: 120, currentFlow: 55 },
      { id: "gate-5", name: "Gate 5 (South)", queueTime: 16, status: "caution", capacity: 130, currentFlow: 110 },
      { id: "gate-6", name: "Gate 6 (Southwest)", queueTime: 23, status: "critical", capacity: 90, currentFlow: 85 }
    ],
    zones: [
      { id: "zone-a", name: "Concourse A (Gates 1 & 2)", density: 34, temp: 22, noiseLevel: 75, sustainability: { wasteBinFill: 35, energyUsage: 450 } },
      { id: "zone-b", name: "Concourse B (Gate 3)", density: 58, temp: 23, noiseLevel: 82, sustainability: { wasteBinFill: 62, energyUsage: 510 } },
      { id: "zone-c", name: "Concourse C (Gate 4)", density: 42, temp: 22, noiseLevel: 78, sustainability: { wasteBinFill: 48, energyUsage: 420 } },
      { id: "zone-d", name: "Concourse D (Gates 5 & 6)", density: 85, temp: 26, noiseLevel: 94, sustainability: { wasteBinFill: 88, energyUsage: 680 } }
    ],
    incidents: [
      {
        id: "inc-1",
        title: "Ticket Scanner Offline at Gate 6",
        location: "Gate 6 (Southwest)",
        severity: "monitor",
        status: "active",
        reportedTime: "10:42 AM",
        description: "Two scanner lanes at Gate 6 are reporting connection drop. Volts dispatched.",
        aiRecommendation: "Direct incoming Gate 6 traffic to Gate 5. Dispatch 2 technical support volunteers from Concourse A.",
        approved: false,
        dismissed: false
      }
    ],
    transit: [
      { id: "transit-shuttle", name: "Stadium Express Shuttle", type: "shuttle", eta: 6, status: "normal", carbonSaved: 1.2 },
      { id: "transit-bus", name: "Metro Venue Bus Line", type: "bus", eta: 11, status: "normal", carbonSaved: 0.9 },
      { id: "transit-rail", name: "Light Rail Stadium Station", type: "rail", eta: 4, status: "normal", carbonSaved: 1.8 },
      { id: "transit-walk", name: "East Pedestrian Boulevard", type: "walk", eta: 15, status: "normal", carbonSaved: 2.5 }
    ],
    volunteers: [
      { id: "vol-1", name: "Sarah Connor", role: "Crowd Monitor", status: "active", assignedZone: "Concourse D", currentTask: "Manage turnstile queues at Gate 6" },
      { id: "vol-2", name: "John Doe", role: "Accessibility Guide", status: "idle", assignedZone: "Concourse A" },
      { id: "vol-3", name: "Elena Rostova", role: "First Aid / Steward", status: "active", assignedZone: "Concourse B", currentTask: "Support sensory space check-ins" },
      { id: "vol-4", name: "Marcus Aurelius", role: "Transit Support", status: "break", assignedZone: "Concourse C" }
    ],
    sustainabilityTips: [
      "Use Stadium Light Rail to save 1.8kg CO2 compared to driving.",
      "Reusable cup drop-off bins are located in Concourses A, B, and D.",
      "Stadium solar power is meeting 42% of Concourse C's energy demand today."
    ]
  };
};

// State random-walk updates
export function randomWalkTelemetry(prev: TelemetryState): TelemetryState {
  // 1. Tick countdown (decrease countdown to kickoff)
  const kickoffCountdown = prev.kickoffCountdown > 0 ? prev.kickoffCountdown - 1 : 0;
  
  // 2. Random walk gates queue times within bounds
  const gates = prev.gates.map((g) => {
    if (g.status === "closed") return g;
    // Walk queue time by -2 to +2
    const change = Math.floor(Math.random() * 5) - 2;
    const newQueue = Math.max(1, Math.min(45, g.queueTime + change));
    let status: "normal" | "caution" | "critical" = "normal";
    if (newQueue > 20) status = "critical";
    else if (newQueue > 10) status = "caution";

    return {
      ...g,
      queueTime: newQueue,
      status,
      currentFlow: Math.max(20, Math.min(g.capacity, g.currentFlow + (Math.floor(Math.random() * 11) - 5)))
    };
  });

  // 3. Random walk zone densities and sustainability parameters
  const zones = prev.zones.map((z) => {
    const densityChange = Math.floor(Math.random() * 7) - 3;
    const newDensity = Math.max(5, Math.min(99, z.density + densityChange));
    const trashChange = Math.floor(Math.random() * 3);
    const newTrash = Math.max(0, Math.min(100, z.sustainability.wasteBinFill + trashChange));
    const energyChange = Math.floor(Math.random() * 21) - 10;
    const newEnergy = Math.max(100, Math.min(1000, z.sustainability.energyUsage + energyChange));

    return {
      ...z,
      density: newDensity,
      sustainability: {
        wasteBinFill: newTrash,
        energyUsage: newEnergy
      }
    };
  });

  return {
    ...prev,
    kickoffCountdown,
    gates,
    zones
  };
}

// Scenario Modifiers
export function applyRainScenario(state: TelemetryState): TelemetryState {
  return {
    ...state,
    weather: "Raining",
    temperature: 17,
    gates: state.gates.map(g => {
      // Security takes longer in rain, spike queues
      const queueTime = g.status === "closed" ? 0 : Math.min(45, g.queueTime + 12);
      const status = queueTime > 20 ? "critical" : (queueTime > 10 ? "caution" : "normal");
      return { ...g, queueTime, status };
    }),
    transit: state.transit.map(t => {
      if (t.type === "walk") {
        return { ...t, eta: t.eta + 5, status: "caution", delayReason: "Wet pathways, walk carefully" };
      }
      if (t.type === "bus" || t.type === "shuttle") {
        return { ...t, eta: t.eta + 8, status: "delayed", delayReason: "Traffic delays due to weather" };
      }
      return t;
    }),
    incidents: [
      ...state.incidents,
      {
        id: `inc-rain-${Date.now()}`,
        title: "Slippery Deck at Gate 3 Hallway",
        location: "Concourse B (Gate 3)",
        severity: "monitor",
        status: "active",
        reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: "Rainwater carrying over onto concourse floor. Slip hazard reported.",
        aiRecommendation: "Deploy cleaning stewards with wet floor signs. Reroute non-assisted fans via Concourse A dry link.",
        approved: false,
        dismissed: false
      }
    ]
  };
}

export function applyGate4ClosureScenario(state: TelemetryState): TelemetryState {
  return {
    ...state,
    gates: state.gates.map(g => {
      if (g.id === "gate-4") {
        return { ...g, queueTime: 0, status: "closed", currentFlow: 0 };
      }
      // Redirected passengers increase queue at Gates 3 and 5
      if (g.id === "gate-3" || g.id === "gate-5") {
        const queueTime = Math.min(45, g.queueTime + 18);
        return { ...g, queueTime, status: "critical" };
      }
      return g;
    }),
    incidents: [
      ...state.incidents,
      {
        id: `inc-gate4-${Date.now()}`,
        title: "Gate 4 Turnstiles Suspended",
        location: "Gate 4 (Southeast)",
        severity: "critical",
        status: "active",
        reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: "Hardware failure suspended all turnstile controllers at Gate 4. Mechanics troubleshooting.",
        aiRecommendation: "Broadcast immediate gate diversion announcement in all languages. Direct volunteers to redirect arriving fans to Gate 3 & Gate 5.",
        approved: false,
        dismissed: false
      }
    ]
  };
}

export function applySurgeScenario(state: TelemetryState): TelemetryState {
  return {
    ...state,
    totalAttendance: 74800, // Spike in attendance
    gates: state.gates.map(g => {
      if (g.status === "closed") return g;
      const queueTime = Math.min(45, g.queueTime + 15);
      return { ...g, queueTime, status: "critical" };
    }),
    zones: state.zones.map(z => ({
      ...z,
      density: Math.min(99, z.density + 25)
    })),
    incidents: [
      ...state.incidents,
      {
        id: `inc-surge-${Date.now()}`,
        title: "Crowd Surge Alert at Gate 6 Concourse",
        location: "Concourse D (Gates 5 & 6)",
        severity: "critical",
        status: "active",
        reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: "Sudden crowd density surge exceeding 85% safety limits detected by visual sensors.",
        aiRecommendation: "Deploy volunteers to establish lane dividers. Broadcast announcement to pause turnstiles for 2 minutes to meter concourse flow.",
        approved: false,
        dismissed: false
      }
    ]
  };
}
