"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/components/providers/UserProvider";
import { resolveStates, type JourneyUnit } from "@/lib/journey";
import { HANZI_PASS, JOURNEY_EVENT, readHanzi, readNodes, type HanziRecord, type NodeRecord } from "@/lib/journey-store";

/**
 * Live journey progress (completion, stars, unlocks) shared by the map,
 * the practice room and the lesson screen so they always agree on what's open.
 */
export function useJourney(units: JourneyUnit[]) {
  const { profile, progress } = useUser();
  const [nodes, setNodes] = useState<Record<string, NodeRecord>>({});
  const [hanzi, setHanzi] = useState<Record<string, HanziRecord>>({});

  useEffect(() => {
    const sync = () => {
      setNodes(readNodes());
      setHanzi(readHanzi());
    };
    sync();
    window.addEventListener(JOURNEY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(JOURNEY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const states = useMemo(
    () => resolveStates(units, { currentLevel: profile.current_hsk_level, progress, nodes, hanzi, hanziPass: HANZI_PASS }),
    [units, profile.current_hsk_level, progress, nodes, hanzi],
  );

  return { states, hanzi };
}
