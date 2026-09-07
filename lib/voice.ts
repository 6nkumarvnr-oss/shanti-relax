// ─────────────────────────────────────────────────────────────
// VoiceOut — plays TTS audio and reports live mouth amplitude for
// the avatar's lip-sync, using Web Audio API analysis (the proven
// MeiVeeram zero-cost lip-sync pattern).
// ─────────────────────────────────────────────────────────────

export class VoiceOut {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private src: MediaElementAudioSourceNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private raf = 0;
  private onAmp: ((v: number) => void) | null = null;

  /** ensure a single AudioContext survives across plays */
  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /**
   * Play an audio object URL. `onAmplitude` fires every frame while
   * speaking (0..1 mouth-open value, smoothed). Returns a promise
   * that resolves when playback finishes. `signal` aborts.
   */
  async play(
    url: string,
    onAmplitude: (v: number) => void,
    signal: AbortSignal
  ): Promise<void> {
    this.stop(); // never overlap two voices

    const audio = new Audio(url);
    audio.crossOrigin = "anonymous";
    this.audio = audio;
    this.onAmp = onAmplitude;

    const ctx = this.ensureCtx();
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.7;
    }
    try {
      if (!this.src) {
        this.src = ctx.createMediaElementSource(audio);
      } else {
        // reuse: retarget the same source node is not possible for a new
        // element, so create a fresh one each time
        this.src = ctx.createMediaElementSource(audio);
      }
      this.src.connect(this.analyser);
      this.analyser.connect(ctx.destination);
    } catch {
      // If the graph fails (rare), fall back to plain playback without lip-sync
      this.src = null;
    }

    // amplitude loop -> mouth-open value
    const data = new Uint8Array(this.analyser?.frequencyBinCount ?? 256);
    let smooth = 0;
    const loop = () => {
      if (!this.audio) return;
      if (this.analyser && this.src) {
        this.analyser.getByteTimeDomainData(data);
        // RMS of the waveform, normalized, with soft gating for silence
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const target = Math.min(1, rms * 3.2);
        smooth += (target - smooth) * 0.35; // smooth follow
        this.onAmp?.(smooth);
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);

    await new Promise<void>((resolve, reject) => {
      const done = () => {
        cleanup();
        resolve();
      };
      const fail = () => {
        cleanup();
        reject(new Error("Audio failed to play"));
      };
      const abort = () => {
        audio.pause();
        cleanup();
        resolve();
      };
      const cleanup = () => {
        audio.removeEventListener("ended", done);
        audio.removeEventListener("error", fail);
        signal.removeEventListener("abort", abort);
      };
      audio.addEventListener("ended", done);
      audio.addEventListener("error", fail);
      signal.addEventListener("abort", abort);
      audio.play().catch(fail);
    });
  }

  /** stop any current playback + amplitude loop */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    this.onAmp?.(0);
  }
}
