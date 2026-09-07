# Shanti — Relaxation Assistant

A calm **talking-avatar** PWA by **MeiVeeram**, for our workers' rest and recovery.
Shanti speaks guided relaxation sessions with a soothing ElevenLabs voice, her
mouth moving in real sync with the audio (Web Audio amplitude lip-sync).

## Features
- **Talking avatar** — serene SVG face with live lip-sync, soft blinking, breathing halo
- **4 guided sessions** — Breathe with me (4-7-8), Body scan, Calm your mind, Sleep wind-down
- **Bilingual** — English + தமிழ் (Tamil), one tap to switch
- **Talk freely** — opens your ElevenLabs Conversational AI agent for free voice conversation
- **PWA** — installable on workers' phones, works offline for the shell

## Setup (one-time, per device)
1. Open the app → enter your **ElevenLabs API key** (stored only on that device)
2. Optional: set your **Voice ID** (e.g. the private "Dhanam" voice) and
   **Talk-mode agent ID** from your ElevenLabs dashboard
3. Tap a session — Shanti takes it from there

## Stack
Next.js 15 · React 19 · Tailwind CSS · Web Audio API lip-sync · ElevenLabs TTS
(conversation mode links to ElevenLabs Conversational AI). No backend of our own —
the app talks straight to ElevenLabs from the device.

*The API key never leaves the device except in the request header to ElevenLabs.*
