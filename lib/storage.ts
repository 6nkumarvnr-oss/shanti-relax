// Local-first storage helpers. All values stay on this device.

const KEYS = {
  apiKey: "shanti_api_key",
  voiceId: "shanti_voice_id",
  agentId: "shanti_agent_id",
  model: "shanti_model",
  lang: "shanti_lang",
  seen: "shanti_setup_done",
} as const;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* non-fatal */
  }
}

export const store = {
  getApiKey: () => safeGet(KEYS.apiKey),
  setApiKey: (v: string) => safeSet(KEYS.apiKey, v),
  getVoiceId: () => safeGet(KEYS.voiceId),
  setVoiceId: (v: string) => safeSet(KEYS.voiceId, v),
  getAgentId: () => safeGet(KEYS.agentId),
  setAgentId: (v: string) => safeSet(KEYS.agentId, v),
  getModel: () => safeGet(KEYS.model),
  setModel: (v: string) => safeSet(KEYS.model, v),
  getLang: () => safeGet(KEYS.lang),
  setLang: (v: string) => safeSet(KEYS.lang, v),
  getSetupDone: () => safeGet(KEYS.seen) === "1",
  setSetupDone: () => safeSet(KEYS.seen, "1"),
  clearAll: () => {
    if (typeof window === "undefined") return;
    try {
      Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* non-fatal */
    }
  },
};
