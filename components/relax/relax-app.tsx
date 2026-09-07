"use client";

import { useEffect, useState } from "react";
import { SetupScreen } from "@/components/relax/setup-screen";
import { RelaxHome } from "@/components/relax/relax-home";
import { store } from "@/lib/storage";
import { DEFAULT_MODEL, DEFAULT_VOICE_ID } from "@/lib/eleven";

export interface Config {
  apiKey: string;
  voiceId: string;
  agentId: string;
  model: string;
}

function loadStored(): Config | null {
  const apiKey = store.getApiKey();
  if (!apiKey || !store.getSetupDone()) return null;
  return {
    apiKey,
    voiceId: store.getVoiceId() || DEFAULT_VOICE_ID,
    agentId: store.getAgentId() || "",
    model: store.getModel() || DEFAULT_MODEL,
  };
}

export function RelaxApp() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [restored, setRestored] = useState(false);

  // restore saved config once on mount
  useEffect(() => {
    setCfg(loadStored());
    setRestored(true);
  }, []);

  const save = (c: Config) => {
    store.setApiKey(c.apiKey);
    store.setVoiceId(c.voiceId);
    store.setAgentId(c.agentId);
    store.setModel(c.model);
    store.setSetupDone();
    setCfg(c);
  };

  const update = (c: Partial<Config>) =>
    setCfg((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...c };
      save(next);
      return next;
    });

  if (!restored) return <div className="app-shell" />;

  return cfg ? (
    <RelaxHome config={cfg} onUpdate={update} />
  ) : (
    <SetupScreen onDone={save} />
  );
}
