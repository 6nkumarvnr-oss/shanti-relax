"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_VOICE_ID, DEFAULT_MODEL } from "@/lib/eleven";

export function SetupScreen({
  onDone,
}: {
  onDone: (cfg: { apiKey: string; voiceId: string; agentId: string; model: string }) => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [agentId, setAgentId] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!apiKey.trim()) {
      setErr("Enter your ElevenLabs API key to continue.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      // validate the key with a cheap call
      const res = await fetch("https://api.elevenlabs.io/v1/user", {
        headers: { "xi-api-key": apiKey.trim() },
      });
      if (!res.ok) {
        setErr(
          res.status === 401
            ? "That key was rejected by ElevenLabs — check it and try again."
            : `ElevenLabs returned ${res.status} — try again shortly.`
        );
        setBusy(false);
        return;
      }
      onDone({
        apiKey: apiKey.trim(),
        voiceId: voiceId.trim() || DEFAULT_VOICE_ID,
        agentId: agentId.trim(),
        model: model.trim() || DEFAULT_MODEL,
      });
    } catch {
      setErr("Couldn't reach ElevenLabs — check your connection.");
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="aurora" />
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2 card-in">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.35)" }}>
              🪷
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Shanti</h1>
            <p className="text-sm text-muted-foreground">
              Your calm talking companion — by MeiVeeram
            </p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              Guided breathing, body-scan relaxation and soothing voice, whenever
              you need a pause. Voices powered by ElevenLabs.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border bg-card p-5 card-in">
            <div className="space-y-1.5">
              <label htmlFor="key" className="text-xs font-medium text-muted-foreground">
                ElevenLabs API key
              </label>
              <Input
                id="key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_…"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="voice" className="text-xs font-medium text-muted-foreground">
                Voice ID <span className="text-muted-foreground/60">(optional — defaults to a soft voice)</span>
              </label>
              <Input
                id="voice"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                placeholder={DEFAULT_VOICE_ID}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="agent" className="text-xs font-medium text-muted-foreground">
                Talk-mode agent ID <span className="text-muted-foreground/60">(optional — enables free conversation)</span>
              </label>
              <Input
                id="agent"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="agent_…"
              />
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              Stored only on this device — used solely to talk to ElevenLabs.
            </p>
            {err && <p className="text-xs text-red-400">{err}</p>}
            <Button className="w-full" onClick={submit} disabled={busy}>
              {busy ? "Checking…" : "Begin"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
