"use client";

// ─────────────────────────────────────────────────────────────
// RelaxHome — the main Shanti experience.
// Top: talking avatar. Below: guided sessions + free-talk mode.
// Session engine: TTS lines with live lip-sync, paced breathing
// cues with an expanding breathing circle, stop anytime.
// Talk mode: ElevenLabs Conversational AI (mic button).
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TalkingAvatar } from "@/components/relax/avatar";
import type { Config } from "@/components/relax/relax-app";
import { BREATHE_LABEL, SESSIONS, type Lang, type Step } from "@/lib/sessions";
import { synthesize } from "@/lib/eleven";
import { VoiceOut } from "@/lib/voice";
import { store } from "@/lib/storage";
import { Button } from "@/components/ui/button";

type Mode = "guided" | "talk";

function Particles() {
  const parts = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        left: `${8 + ((i * 37) % 84)}%`,
        size: 3 + ((i * 7) % 4),
        delay: `${(i * 1.7) % 12}s`,
        dur: `${10 + ((i * 3) % 8)}s`,
        bottom: `${5 + ((i * 13) % 30)}%`,
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {parts.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
}

export function RelaxHome({
  config,
  onUpdate,
}: {
  config: Config;
  onUpdate: (c: Partial<Config>) => void;
}) {
  const [lang, setLang] = useState<Lang>((store.getLang() as Lang) || "en");
  const [mode, setMode] = useState<Mode>("guided");
  const [mouthOpen, setMouthOpen] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  // session state
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [breath, setBreath] = useState<{ phase: "in" | "hold" | "out"; seconds: number } | null>(null);
  const [error, setError] = useState("");

  const voice = useRef<VoiceOut | null>(null);
  const abort = useRef<AbortController | null>(null);
  const running = useRef(false);

  const ensureVoice = () => {
    if (!voice.current) voice.current = new VoiceOut();
    return voice.current;
  };

  const stopSession = useCallback(() => {
    running.current = false;
    abort.current?.abort();
    abort.current = null;
    voice.current?.stop();
    setSpeaking(false);
    setMouthOpen(0);
    setBreath(null);
    setActiveSession(null);
    setStepIndex(0);
  }, []);

  useEffect(() => () => stopSession(), [stopSession]);

  const runSession = async (id: string) => {
    const session = SESSIONS.find((s) => s.id === id);
    if (!session || running.current) return;

    setError("");
    setActiveSession(id);
    running.current = true;
    abort.current = new AbortController();
    const signal = abort.current.signal;
    const script = session.script[lang];
    setStepCount(script.length);

    for (let i = 0; i < script.length; i++) {
      if (!running.current || signal.aborted) break;
      setStepIndex(i + 1);
      const step: Step = script[i];

      if ("say" in step) {
        try {
          const url = await synthesize(step.say, {
            apiKey: config.apiKey,
            voiceId: config.voiceId,
            model: config.model,
          });
          if (!running.current || signal.aborted) break;
          setSpeaking(true);
          await ensureVoice().play(url, setMouthOpen, signal);
          setSpeaking(false);
          setMouthOpen(0);
          if (!running.current || signal.aborted) break;
          await new Promise((r) => setTimeout(r, 900)); // gentle pause between lines
        } catch (e) {
          running.current = false;
          setSpeaking(false);
          setMouthOpen(0);
          setError(e instanceof Error ? e.message : "Voice failed — check your key in Settings.");
          setActiveSession(null);
          return;
        }
      } else if ("breathe" in step) {
        setBreath({ phase: step.breathe, seconds: step.seconds });
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, step.seconds * 1000);
          signal.addEventListener("abort", () => {
            clearTimeout(t);
            resolve();
          }, { once: true });
        });
        if (!running.current || signal.aborted) break;
        setBreath(null);
        await new Promise((r) => setTimeout(r, 700));
      }
    }

    running.current = false;
    setBreath(null);
    setSpeaking(false);
    setMouthOpen(0);
    setActiveSession(null);
  };

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "ta" : "en";
    setLang(next);
    store.setLang(next);
  };

  const session = SESSIONS.find((s) => s.id === activeSession);
  const progress = session ? (stepIndex / stepCount) * 100 : 0;

  return (
    <div className="app-shell">
      <div className="aurora" />
      <Particles />

      {/* header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-4">
        <div>
          <h1 className="text-lg font-semibold leading-tight">Shanti</h1>
          <p className="text-[11px] text-muted-foreground">MeiVeeram · Relaxation Assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="text-xs rounded-md border border-border bg-secondary px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {lang === "en" ? "EN · தமிழ்" : "தமிழ் · EN"}
          </button>
          <button
            onClick={() => {
              stopSession();
              store.clearAll();
              location.reload();
            }}
            aria-label="Settings reset"
            className="text-xs rounded-md border border-border bg-secondary px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            ⚙︎
          </button>
        </div>
      </header>

      {/* avatar stage */}
      <section className="relative z-10 flex flex-col items-center justify-center flex-1 min-h-0 py-2">
        <TalkingAvatar
          size={230}
          speaking={speaking}
          mouthOpen={mouthOpen}
          breathPhase={breath?.phase === "in" ? 1 : 0}
        />

        {/* breathing circle overlay */}
        {breath && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="rounded-full transition-all ease-in-out"
              style={{
                width: 150,
                height: 150,
                marginTop: -30,
                background: "radial-gradient(circle, hsl(44 80% 46% / 0.28), transparent 70%)",
                border: "2px solid hsl(44 80% 46% / 0.5)",
                transitionDuration: `${breath.seconds * 1000 - 300}ms`,
                transform:
                  breath.phase === "in"
                    ? "scale(1.35)"
                    : breath.phase === "hold"
                      ? "scale(1.35)"
                      : "scale(0.85)",
              }}
            />
            <p className="absolute bottom-3 text-lg font-medium text-primary/90">
              {BREATHE_LABEL[lang][breath.phase]}
              <span className="block text-center text-xs text-muted-foreground">
                {breath.seconds}s
              </span>
            </p>
          </div>
        )}

        {/* status line */}
        <p className="text-xs text-muted-foreground mt-3 h-5">
          {error
            ? ""
            : speaking
              ? lang === "en" ? "Speaking…" : "பேசுகிறேன்…"
              : breath
                ? BREATHE_LABEL[lang][breath.phase]
                : activeSession
                  ? lang === "en" ? "In session…" : "பாடம் நடக்கிறது…"
                  : lang === "en" ? "Choose a moment of calm below" : "கீழே ஓர் அமைதியான நேரம் தேர்வு செய்யுங்க"}
        </p>
        {error && <p className="text-xs text-red-400 mt-1 px-6 text-center">{error}</p>}
      </section>

      {/* mode tabs */}
      <nav className="relative z-10 flex gap-1 mx-5 rounded-lg bg-secondary p-1 text-xs font-medium">
        <button
          className={`flex-1 rounded-md py-2 transition-colors ${mode === "guided" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          onClick={() => { stopSession(); setMode("guided"); }}
        >
          {lang === "en" ? "Guided sessions" : "வழிகாட்டப்பட்ட பாடம்"}
        </button>
        <button
          className={`flex-1 rounded-md py-2 transition-colors ${mode === "talk" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          onClick={() => { stopSession(); setMode("talk"); }}
        >
          {lang === "en" ? "Talk freely" : "சுதந்திரமா பேசு"}
        </button>
      </nav>

      {/* content area */}
      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-4 chat-scroll">
        {mode === "guided" ? (
          activeSession ? (
            <div className="flex flex-col items-center gap-4 pt-4 card-in">
              <p className="text-sm text-muted-foreground">
                {session?.emoji} {session?.title[lang]}
              </p>
              <div className="w-full max-w-xs h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <Button variant="outline" onClick={stopSession}>
                {lang === "en" ? "End session" : "பாடத்தை நிறுத்து"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 pb-2">
              {SESSIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => runSession(s.id)}
                  className="card-in flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/50 active:scale-[0.99]"
                >
                  <span className="text-2xl" aria-hidden>{s.emoji}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{s.title[lang]}</span>
                    <span className="block text-xs text-muted-foreground">{s.subtitle[lang]}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground/70">~{s.minutes} min</span>
                </button>
              ))}
            </div>
          )
        ) : (
          <TalkPanel config={config} lang={lang} />
        )}
      </main>
    </div>
  );
}

/* ── Talk mode — ElevenLabs Conversational AI ── */

function TalkPanel({ config, lang }: { config: Config; lang: Lang }) {
  const [state, setState] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [msg, setMsg] = useState("");

  const start = async () => {
    if (!config.agentId) {
      setState("error");
      setMsg(
        lang === "en"
          ? "Add your Talk-mode agent ID in setup (⚙︎ → reset) to enable free conversation."
          : "சுதந்திரமா பேச — agent ID-ஐ setup-ல சேர்க்கணும்."
      );
      return;
    }
    // Basic mic permission check first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("error");
      setMsg(
        lang === "en"
          ? "Microphone access is needed for talking. Allow it in your browser settings."
          : "பேசுறதுக்கு மைக் அனுமதி வேணும்."
      );
      return;
    }
    setState("connecting");
    // Voice conversation runs through ElevenLabs Conversational AI.
    // Open the agent in your ElevenLabs dashboard on the phone:
    //   https://elevenlabs.io/app/talk-to-your-agent?agent_id=<your agent id>
    const url = `https://elevenlabs.io/app/talk-to-your-agent?agent_id=${encodeURIComponent(config.agentId)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setState("idle");
  };

  return (
    <div className="flex flex-col items-center gap-4 pt-3 card-in">
      <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
        {lang === "en"
          ? "Speak your mind to Shanti — she listens and answers with a calm voice, powered by your ElevenLabs agent."
          : "ஷாந்தியிடம் சொல்லுங்க — அவ கேட்டு அமைதியான குரலில பதில் சொல்லுவா."}
      </p>
      <button
        onClick={start}
        className={`w-28 h-28 rounded-full text-4xl transition-transform active:scale-95 ${
          state === "connecting" ? "opacity-70" : ""
        }`}
        style={{
          background: "radial-gradient(circle at 35% 30%, hsl(44 80% 55%), hsl(40 85% 40%))",
          border: "2px solid hsl(44 80% 46% / 0.6)",
        }}
        aria-label="Start talking"
      >
        🎙️
      </button>
      <p className="text-xs text-muted-foreground">
        {state === "connecting"
          ? lang === "en" ? "Opening voice line…" : "திறக்கிறது…"
          : lang === "en" ? "Tap to start a voice conversation" : "பேச ஆரம்பிக்க தட்டுங்க"}
      </p>
      {state === "error" && <p className="text-xs text-red-400 text-center px-8">{msg}</p>}
    </div>
  );
}
