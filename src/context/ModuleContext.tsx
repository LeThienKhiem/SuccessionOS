"use client";

import * as React from "react";

export interface ModuleState {
  marketIntelligence: boolean;
  // thêm các module khác sau
}

export interface ModuleContextType {
  modules: ModuleState;
  toggleModule: (key: keyof ModuleState) => void;
  isActive: (key: keyof ModuleState) => boolean;
}

const STORAGE_KEY = "succession-os-modules";

const defaultState: ModuleState = {
  marketIntelligence: false,
};

const ModuleContext = React.createContext<ModuleContextType | null>(null);

function safeParse(raw: string | null): Partial<ModuleState> | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object") return null;
    return v as Partial<ModuleState>;
  } catch {
    return null;
  }
}

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = React.useState<ModuleState>(defaultState);
  const didHydrate = React.useRef(false);

  React.useEffect(() => {
    const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
    if (parsed) setModules((prev) => ({ ...prev, ...parsed }));
    didHydrate.current = true;
  }, []);

  React.useEffect(() => {
    if (!didHydrate.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
  }, [modules]);

  const toggleModule = React.useCallback((key: keyof ModuleState) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isActive = React.useCallback((key: keyof ModuleState) => {
    return Boolean(modules[key]);
  }, [modules]);

  const value = React.useMemo<ModuleContextType>(
    () => ({ modules, toggleModule, isActive }),
    [modules, toggleModule, isActive]
  );

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
}

export function useModuleContext() {
  const ctx = React.useContext(ModuleContext);
  if (!ctx) {
    throw new Error("useModuleContext must be used within <ModuleProvider />");
  }
  return ctx;
}

