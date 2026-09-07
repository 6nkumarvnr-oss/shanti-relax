// ─────────────────────────────────────────────────────────────
// Guided relaxation sessions — bilingual (English / தமிழ்).
// Each session is a sequence of steps: spoken lines (TTS) and
// paced breathing cues (visual). Written in a slow, soothing voice.
// ─────────────────────────────────────────────────────────────

export type Lang = "en" | "ta";

export type Step =
  | { say: string }                                    // spoken via TTS
  | { breathe: "in" | "hold" | "out"; seconds: number }; // visual breathing cue

export interface Session {
  id: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  emoji: string;
  minutes: number;
  script: Record<Lang, Step[]>;
}

export const SESSIONS: Session[] = [
  {
    id: "breathe",
    emoji: "🌬️",
    minutes: 2,
    title: { en: "Breathe with me", ta: "என்னுடன் மூச்சு விடு" },
    subtitle: {
      en: "4–7–8 calming breath",
      ta: "4–7–8 அமைதியான மூச்சு",
    },
    script: {
      en: [
        { say: "Welcome. Let's take two minutes to slow down together. Sit comfortably, and let your shoulders drop." },
        { breathe: "in", seconds: 4 },
        { breathe: "hold", seconds: 7 },
        { breathe: "out", seconds: 8 },
        { say: "Beautiful. Now follow the circle — in through your nose, out through your mouth." },
        { breathe: "in", seconds: 4 },
        { breathe: "hold", seconds: 7 },
        { breathe: "out", seconds: 8 },
        { breathe: "in", seconds: 4 },
        { breathe: "hold", seconds: 7 },
        { breathe: "out", seconds: 8 },
        { say: "Notice how your body already feels a little softer. One last round." },
        { breathe: "in", seconds: 4 },
        { breathe: "hold", seconds: 7 },
        { breathe: "out", seconds: 8 },
        { say: "Well done. Carry this calm with you. You're doing better than you think." },
      ],
      ta: [
        { say: "வணக்கம். இரண்டு நிமிடம் நாம சேர்ந்து நிதாணமா ஓய்வெடுப்போம். நல்லா உட்காருங்க, தோள்களை தளர்வா விடுங்க." },
        { breathe: "in", seconds: 4 },
        { breathe: "hold", seconds: 7 },
        { breathe: "out", seconds: 8 },
        { say: "நல்லது. இப்போ வட்டத்தை பாருங்க — மூக்கால உள்ள வாங்க, வாயால வெளியிடுங்க." },
        { breathe: "in", seconds: 4 },
        { breathe: "hold", seconds: 7 },
        { breathe: "out", seconds: 8 },
        { breathe: "in", seconds: 4 },
        { breathe: "hold", seconds: 7 },
        { breathe: "out", seconds: 8 },
        { say: "உடம்பு கொஞ்சம் லேசா இருக்குனு உணருங்க. இன்னொரு முறை." },
        { breathe: "in", seconds: 4 },
        { breathe: "hold", seconds: 7 },
        { breathe: "out", seconds: 8 },
        { say: "நல்ல வேலை. இந்த அமைதியை உங்களோட கூட்டிக்கிட்டு போங்க." },
      ],
    },
  },
  {
    id: "bodyscan",
    emoji: "🧘",
    minutes: 4,
    title: { en: "Body scan", ta: "உடம்பு பரிசோதனை" },
    subtitle: {
      en: "Release tension head to toe",
      ta: "தலையிலிருந்து பாதம் வரை தளர்வு",
    },
    script: {
      en: [
        { say: "Lie back or sit comfortably. Close your eyes if you like. We'll release tension, piece by piece." },
        { say: "Start at your forehead. Let it be smooth, like still water." },
        { breathe: "out", seconds: 6 },
        { say: "Now your jaw. Unclench it. Let your teeth part slightly." },
        { breathe: "out", seconds: 6 },
        { say: "Your shoulders — let them fall. They carry enough already." },
        { breathe: "out", seconds: 6 },
        { say: "Your arms and hands — let them grow heavy and warm." },
        { breathe: "out", seconds: 6 },
        { say: "Your chest and belly — each breath loosens them a little more." },
        { breathe: "out", seconds: 6 },
        { say: "Your legs, all the way to your feet — let them rest completely." },
        { breathe: "out", seconds: 8 },
        { say: "Your whole body is heavy, warm, and calm. Rest here as long as you need." },
      ],
      ta: [
        { say: "நல்லா சாயுங்க அல்லது உட்காருங்க. வேணும்னா கண்ணை மூடுங்க. ஒவ்வொரு பாகமா கஷ்டத்தை விடுவோம்." },
        { say: "நெற்றியில ஆரம்பிக்கலாம். அத நீர்போல அமைதியா இருக்க விடுங்க." },
        { breathe: "out", seconds: 6 },
        { say: "இப்போ காது பக்கம். பல்லை கடிக்காதீங்க, லேசா விடுங்க." },
        { breathe: "out", seconds: 6 },
        { say: "தோள்களை கீழே தள்ளுங்க. அவ ஏற்கனவே நிறைய சுமந்திருக்கு." },
        { breathe: "out", seconds: 6 },
        { say: "கைகளும் விரல்களும் — கனமா, சூடா இருக்க விடுங்க." },
        { breathe: "out", seconds: 6 },
        { say: "மார்பும் வயிறும் — ஒவ்வொரு மூச்சிலும் கொஞ்சம் தளருது." },
        { breathe: "out", seconds: 6 },
        { say: "கால் முழுக்க, பாதம் வரை — முழுசா ஓய்வெடுக்க விடுங்க." },
        { breathe: "out", seconds: 8 },
        { say: "உடம்பு முழுக்கு கனமா, வெதுவெதுப்பா, அமைதியா இருக்கு. நீங்க நினைக்குற அளவுக்கு ஓய்வெடுங்க." },
      ],
    },
  },
  {
    id: "calmmind",
    emoji: "🌙",
    minutes: 3,
    title: { en: "Calm your mind", ta: "மனதை அமைதிப்படுத்து" },
    subtitle: {
      en: "Let go of the day's weight",
      ta: "இன்றைய பாரத்தை விடு",
    },
    script: {
      en: [
        { say: "Whatever happened today — the noise, the rush, the pressure — it can wait." },
        { say: "Right now, this moment belongs only to you." },
        { say: "Thoughts will come. That's what minds do. Picture each one as a cloud, drifting across the sky." },
        { breathe: "out", seconds: 6 },
        { say: "You don't have to chase them. Watch them pass, and come back to your breath." },
        { breathe: "out", seconds: 6 },
        { say: "You did enough today. Truly. Rest is not laziness — rest is repair." },
        { say: "Take a slow breath in… and let it all go." },
        { breathe: "in", seconds: 4 },
        { breathe: "out", seconds: 8 },
        { say: "You are safe here. Stay as long as you like." },
      ],
      ta: [
        { say: "இன்னைக்கு எது நடந்தாலும் — சத்தம், அவசரம், அழுத்தம் — அது இப்போ காத்திருக்கும்." },
        { say: "இந்த நிமிடம் உங்களுக்கு மட்டும் தான் சொந்தம்." },
        { say: "எண்ணங்க வரும். மனசுன்னா அப்படித்தான். ஒவ்வொண்ணையும் மேகமா நினைச்சு, வானத்துல கடந்து போற மாதிரி பாருங்க." },
        { breathe: "out", seconds: 6 },
        { say: "அத துரத்தணும்னு இல்ல. கடந்து போகட்டும், மூச்குக்கு திரும்பி வாங்க." },
        { breathe: "out", seconds: 6 },
        { say: "இன்னைக்கு நீங்க பத்தாத்துண்டு பண்ணிட்டீங்க. உண்மையாவே. ஓய்வு சோம்பல் இல்ல — ஓய்வுனா அது பழுது பார்க்குறது." },
        { say: "மெதுவா மூச்சு உள்ள வாங்க… மொத்தத்தையும் விட்டுடுங்க." },
        { breathe: "in", seconds: 4 },
        { breathe: "out", seconds: 8 },
        { say: "இங்க நீங்க பத்திரம். நினைக்குற அளவுக்கு இருங்க." },
      ],
    },
  },
  {
    id: "sleep",
    emoji: "💤",
    minutes: 4,
    title: { en: "Wind down for sleep", ta: "நித்திரைக்கு தயார்" },
    subtitle: {
      en: "Soft words for the end of the day",
      ta: "நாள் முடிவில் மெதுமான வார்த்தைகள்",
    },
    script: {
      en: [
        { say: "The day is finished. Nothing more is asked of you tonight." },
        { say: "Feel the bed holding you — completely supported, nothing to hold up." },
        { breathe: "out", seconds: 8 },
        { say: "Tomorrow's worries are not tonight's work. Set them down at the door." },
        { breathe: "out", seconds: 8 },
        { say: "Breathe slowly with me… in… and out…" },
        { breathe: "in", seconds: 4 },
        { breathe: "out", seconds: 8 },
        { breathe: "in", seconds: 4 },
        { breathe: "out", seconds: 8 },
        { say: "Let your eyelids be heavy. Let your thoughts drift further apart." },
        { breathe: "out", seconds: 10 },
        { say: "Rest now. I'll keep watch. Goodnight." },
      ],
      ta: [
        { say: "இன்னைக்கு நாள் முடிஞ்சிடுச்சு. இன்னிக்கு ராத்திரி உங்களுக்கு வேற எதுவும் தேவையில்ல." },
        { say: "கட்டில உங்களை தாங்குறத உணருங்க — முழுசா சப்போர்ட், நீங்க எதையும் தாங்கணும் இல்ல." },
        { breathe: "out", seconds: 8 },
        { say: "நாளைக்கு கவலை இன்னிக்கு ராத்திரி வேலை இல்ல. அத கதவுல வச்சிட்டு வாங்க." },
        { breathe: "out", seconds: 8 },
        { say: "என்னோட மெதுவா மூச்சு விடுங்க… உள்ள… வெளிய…" },
        { breathe: "in", seconds: 4 },
        { breathe: "out", seconds: 8 },
        { breathe: "in", seconds: 4 },
        { breathe: "out", seconds: 8 },
        { say: "கண்ண கனமா இருக்க விடுங்க. எண்ணங்க மெல்ல மெல்ல தூரமாகட்டும்." },
        { breathe: "out", seconds: 10 },
        { say: "இப்போ ஓய்வெடுங்க. நான் பாத்துக்கிறேன். குட் நைட்." },
      ],
    },
  },
];

export const BREATHE_LABEL: Record<Lang, Record<"in" | "hold" | "out", string>> = {
  en: { in: "Breathe in", hold: "Hold", out: "Breathe out" },
  ta: { in: "உள்ள வாங்க", hold: "நிறுத்துங்க", out: "வெளியிடுங்க" },
};
