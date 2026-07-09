"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  TelemetryState,
  createInitialState,
  randomWalkTelemetry,
  applyRainScenario,
  applyGate4ClosureScenario,
  applySurgeScenario
} from "../data/mockTelemetry";

interface TelemetryContextType {
  state: TelemetryState;
  role: "admin" | "ops" | "volunteer";
  wheelchairMode: boolean;
  simplifiedMode: boolean;
  isOffline: boolean;
  setRole: (role: "admin" | "ops" | "volunteer") => void;
  setWheelchairMode: (mode: boolean) => void;
  setSimplifiedMode: (mode: boolean) => void;
  setVenue: (venue: string) => void;
  triggerRain: () => void;
  triggerGate4Closure: () => void;
  triggerSurge: () => void;
  resetTelemetry: () => void;
  approveIncidentAlert: (incidentId: string) => void;
  dismissIncidentAlert: (incidentId: string) => void;
  dispatchTask: (title: string, zone: string, volId: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "stadiumos_telemetry_state";
const ROLE_KEY = "stadiumos_user_role";
const WHEELCHAIR_KEY = "stadiumos_wheelchair_mode";
const SIMPLIFIED_KEY = "stadiumos_simplified_mode";

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TelemetryState>(() => {
    // SSR Safe initial state
    return createInitialState("Los Angeles Stadium");
  });
  
  const [role, setRoleState] = useState<"admin" | "ops" | "volunteer">("ops");
  const [wheelchairMode, setWheelchairModeState] = useState(false);
  const [simplifiedMode, setSimplifiedModeState] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        try {
          setState(JSON.parse(savedState));
        } catch (e) {
          console.error("Failed to parse stored state:", e);
        }
      }

      const savedRole = localStorage.getItem(ROLE_KEY) as "admin" | "ops" | "volunteer";
      if (savedRole) setRoleState(savedRole);

      const savedWheelchair = localStorage.getItem(WHEELCHAIR_KEY);
      if (savedWheelchair) setWheelchairModeState(savedWheelchair === "true");

      const savedSimplified = localStorage.getItem(SIMPLIFIED_KEY);
      if (savedSimplified) setSimplifiedModeState(savedSimplified === "true");

      // Offline detection
      setIsOffline(!navigator.onLine);
      const goOnline = () => setIsOffline(false);
      const goOffline = () => setIsOffline(true);

      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);

      return () => {
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }
  }, []);

  // Save changes and sync tabs
  const saveState = (newState: TelemetryState) => {
    setState(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
          try {
            setState(JSON.parse(e.newValue));
          } catch (err) {
            console.error(err);
          }
        }
        if (e.key === ROLE_KEY && e.newValue) {
          setRoleState(e.newValue as any);
        }
        if (e.key === WHEELCHAIR_KEY && e.newValue) {
          setWheelchairModeState(e.newValue === "true");
        }
        if (e.key === SIMPLIFIED_KEY && e.newValue) {
          setSimplifiedModeState(e.newValue === "true");
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  // Telemetry tick loop (random-walk)
  useEffect(() => {
    if (isOffline) return; // Freeze telemetry if offline

    const interval = setInterval(() => {
      setState(prev => {
        const next = randomWalkTelemetry(prev);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }, 4000); // Walk stats every 4 seconds

    return () => clearInterval(interval);
  }, [isOffline]);

  const setRole = (newRole: "admin" | "ops" | "volunteer") => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_KEY, newRole);
  };

  const setWheelchairMode = (mode: boolean) => {
    setWheelchairModeState(mode);
    localStorage.setItem(WHEELCHAIR_KEY, String(mode));
  };

  const setSimplifiedMode = (mode: boolean) => {
    setSimplifiedModeState(mode);
    localStorage.setItem(SIMPLIFIED_KEY, String(mode));
  };

  const setVenue = (venue: string) => {
    const fresh = createInitialState(venue);
    saveState(fresh);
  };

  const triggerRain = () => {
    const updated = applyRainScenario(state);
    saveState(updated);
  };

  const triggerGate4Closure = () => {
    const updated = applyGate4ClosureScenario(state);
    saveState(updated);
  };

  const triggerSurge = () => {
    const updated = applySurgeScenario(state);
    saveState(updated);
  };

  const resetTelemetry = () => {
    const resetState = createInitialState(state.currentVenue);
    saveState(resetState);
  };

  const approveIncidentAlert = (incidentId: string) => {
    const updated = {
      ...state,
      incidents: state.incidents.map(inc => {
        if (inc.id === incidentId) {
          return { ...inc, approved: true, dismissed: false };
        }
        return inc;
      })
    };
    saveState(updated);
  };

  const dismissIncidentAlert = (incidentId: string) => {
    const updated = {
      ...state,
      incidents: state.incidents.map(inc => {
        if (inc.id === incidentId) {
          return { ...inc, approved: false, dismissed: true };
        }
        return inc;
      })
    };
    saveState(updated);
  };

  const dispatchTask = (title: string, zone: string, volId: string) => {
    const updated = {
      ...state,
      volunteers: state.volunteers.map(vol => {
        if (vol.id === volId) {
          return {
            ...vol,
            status: "active" as const,
            assignedZone: zone,
            currentTask: title
          };
        }
        return vol;
      })
    };
    saveState(updated);
  };

  return (
    <TelemetryContext.Provider
      value={{
        state,
        role,
        wheelchairMode,
        simplifiedMode,
        isOffline,
        setRole,
        setWheelchairMode,
        setSimplifiedMode,
        setVenue,
        triggerRain,
        triggerGate4Closure,
        triggerSurge,
        resetTelemetry,
        approveIncidentAlert,
        dismissIncidentAlert,
        dispatchTask
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
