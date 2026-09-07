// ─────────────────────────────────────────────────────────────
// ElevenLabs TTS client — streamed straight to the browser.
// The API key is provided by the owner in setup and never leaves
// the device except in the request header to api.elevenlabs.io.
// ─────────────────────────────────────────────────────────────

export const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // soft default voice
export const DEFAULT_MODEL = "eleven_multilingual_v2"; // supports Tamil + English

export interface TtsOptions {
  apiKey: string;
  voiceId: string;
  model: string;
}

const audioCache = new Map<string, string>(); // text -> object URL

export async function synthesize(
  text: string,
  opts: TtsOptions
): Promise<string> {
  const key = `${opts.voiceId}|${opts.model}|${text}`;
  const cached = audioCache.get(key);
  if (cached) return cached;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${opts.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": opts.apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: opts.model,
        voice_settings: {
          stability: 0.75, // calm, steady delivery
          similarity_boost: 0.85,
          style: 0.2, // gentle, soft
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 401)
      throw new Error("ElevenLabs rejected the API key — check it in Settings.");
    if (res.status === 429)
      throw new Error("ElevenLabs quota reached — try again in a little while.");
    throw new Error(
      `ElevenLabs TTS ${res.status}: ${detail.slice(0, 140) || res.statusText}`
    );
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(key, url);
  if (audioCache.size > 40) {
    // trim the cache — old object URLs
    const oldest = audioCache.keys().next().value;
    if (oldest) {
      URL.revokeObjectURL(audioCache.get(oldest)!);
      audioCache.delete(oldest);
    }
  }
  return url;
}
