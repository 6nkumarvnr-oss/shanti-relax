"use client";

// ─────────────────────────────────────────────────────────────
// Shanti — the talking avatar.
// A serene SVG face whose mouth scales with live audio amplitude
// (Web Audio RMS), eyes blink softly, halo breathes with a slow
// rhythm. Zero-cost lip-sync — no paid avatar service.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

export interface AvatarProps {
  size?: number;
  speaking: boolean; // talking mouth active
  mouthOpen: number; // 0..1 from audio analysis
  breathPhase: 0 | 1; // 0 = normal, 1 = guided inhale (halo expands)
}

export function TalkingAvatar({ size = 260, speaking, mouthOpen, breathPhase }: AvatarProps) {
  const [blink, setBlink] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // organic random blinking
  useEffect(() => {
    let cancelled = false;
    const schedule = () => {
      const delay = 2600 + Math.random() * 3200;
      timer.current = setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        setTimeout(() => {
          if (!cancelled) setBlink(false);
          schedule();
        }, 140);
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const eyeH = blink ? 0.6 : 3.2;
  const mouthRy = 2 + mouthOpen * 9; // subtle -> open
  const mouthRx = 8 + mouthOpen * 3.5;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* breathing halo */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-[4000ms] ease-in-out ${
          breathPhase === 1 ? "scale-110" : "halo-idle"
        }`}
        style={{
          background:
            "radial-gradient(circle, hsl(44 80% 46% / 0.22) 0%, hsl(160 55% 25% / 0.18) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full border"
        style={{
          inset: "10%",
          borderColor: "hsl(44 80% 46% / 0.25)",
          animation: "halo-breathe 8s ease-in-out infinite",
        }}
      />

      <svg viewBox="0 0 100 100" width={size * 0.82} height={size * 0.82} aria-hidden="true">
        <defs>
          <radialGradient id="faceGrad" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#F2E8C9" />
            <stop offset="60%" stopColor="#D9C89B" />
            <stop offset="100%" stopColor="#B9A87A" />
          </radialGradient>
          <radialGradient id="hairGrad" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#2E5E48" />
            <stop offset="100%" stopColor="#123826" />
          </radialGradient>
        </defs>

        {/* hair */}
        <ellipse cx="50" cy="40" rx="26" ry="27" fill="url(#hairGrad)" />
        {/* bun */}
        <circle cx="50" cy="14.5" r="7.5" fill="#1C4A34" />
        <circle cx="50" cy="14.5" r="7.5" fill="none" stroke="#D4A017" strokeWidth="0.8" opacity="0.7" />

        {/* face */}
        <ellipse cx="50" cy="46" rx="21" ry="24" fill="url(#faceGrad)" />

        {/* gold tilak */}
        <ellipse cx="50" cy="30.5" rx="1.6" ry="2.3" fill="#D4A017" />

        {/* eyebrows — gently raised (serene) */}
        <path d="M 38.5 39.5 Q 42.5 37.5 46.5 39.3" fill="none" stroke="#3A4A38" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 53.5 39.3 Q 57.5 37.5 61.5 39.5" fill="none" stroke="#3A4A38" strokeWidth="1.3" strokeLinecap="round" />

        {/* eyes — closed-calm arcs; flatten fully on blink; slightly open when speaking */}
        {blink ? (
          <>
            <path d="M 38.5 45.2 Q 42.5 44.4 46.5 45.2" fill="none" stroke="#233124" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 53.5 45.2 Q 57.5 44.4 61.5 45.2" fill="none" stroke="#233124" strokeWidth="1.6" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="42.5" cy="44.6" rx="2.4" ry={speaking ? 1.1 : 1.6} fill="#233124" />
            <ellipse cx="57.5" cy="44.6" rx="2.4" ry={speaking ? 1.1 : 1.6} fill="#233124" />
          </>
        )}

        {/* nose */}
        <path d="M 50 48 Q 48.8 51.6 50 52.4" fill="none" stroke="#B7A578" strokeWidth="1.1" strokeLinecap="round" />

        {/* mouth — the lip-sync element */}
        <ellipse
          cx="50"
          cy="59"
          rx={mouthRx}
          ry={mouthRy}
          fill="#7C3F3F"
          opacity={speaking ? 0.95 : 0.9}
          style={{ transition: "ry 60ms linear, rx 90ms linear" }}
        />
        {/* subtle smile shadow when nearly closed */}
        {!speaking || mouthOpen < 0.08 ? (
          <path d="M 44.5 58.6 Q 50 61.8 55.5 58.6" fill="none" stroke="#8A5A45" strokeWidth="1.2" strokeLinecap="round" />
        ) : null}

        {/* earrings */}
        <circle cx="29.5" cy="51" r="1.5" fill="#D4A017" />
        <circle cx="70.5" cy="51" r="1.5" fill="#D4A017" />

        {/* neck + shoulders */}
        <path d="M 43.5 67 L 43.5 72 Q 50 76 56.5 72 L 56.5 67" fill="#C9B891" />
        <path d="M 28 100 Q 30 80 43.5 72.5 Q 50 77 56.5 72.5 Q 70 80 72 100 Z" fill="#1C4A34" />
        <path d="M 44.5 72.5 L 50 78 L 55.5 72.5" fill="#F5EDD6" />
        {/* gold necklace */}
        <path d="M 40 76 Q 50 84 60 76" fill="none" stroke="#D4A017" strokeWidth="1.2" />
        <circle cx="50" cy="82.5" r="1.4" fill="#D4A017" />
      </svg>
    </div>
  );
}
