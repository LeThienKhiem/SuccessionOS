"use client";

import * as React from "react";
import { useModuleContext } from "@/context/ModuleContext";
import { MarketIntelCard } from "@/components/MarketIntelCard";

export function MarketIntelSection({ employeeId }: { employeeId: string }) {
  const { isActive } = useModuleContext();
  if (!isActive("marketIntelligence")) return null;
  return <MarketIntelCard employeeId={employeeId} />;
}

