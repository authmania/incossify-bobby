// Client-safe constants (no server imports). Import from here in UI code.

export interface TaskDef {
  id: string;
  title: string;
  reward: number;
  icon: "share" | "pen" | "clipboard" | "video" | "star" | "sparkles";
}

export const TASK_CATALOG: TaskDef[] = [
  { id: "innshare", title: "Inn-Share", reward: 500, icon: "share" },
  { id: "innreshare", title: "Inn-Reshare", reward: 200, icon: "share" },
  { id: "ghostwriter", title: "Inn Ghostwriter", reward: 1000, icon: "pen" },
  { id: "survey", title: "Inn Survey", reward: 1000, icon: "clipboard" },
  { id: "videoclip", title: "Inn Video Clipping", reward: 1500, icon: "video" },
  { id: "moviereview", title: "Inn Movie Review", reward: 500, icon: "star" },
  { id: "aiassistant", title: "Inn AI Assistant", reward: 750, icon: "sparkles" },
];

export const SHARE_CLAIMS = [
  { id: "sh1", title: "Inn Share 1", reward: 1000 },
  { id: "sh2", title: "Inn Share 2", reward: 1000 },
];

export const SONG_REWARD = 2000;

export interface Song {
  id: string;
  artist: string;
  song: string;
  term: string;
}

// 4 daily-rotating sets of 4 songs (princess structure)
export const MUSIC_SETS: Song[][] = [
  [
    { id: "s1", artist: "Wizkid", song: "Essence (feat. Tems)", term: "wizkid essence tems" },
    { id: "s2", artist: "Burna Boy", song: "No Fit Vex", term: "no fit vex" },
    { id: "s3", artist: "Davido", song: "B4 B4", term: "davido b4 b4" },
    { id: "s4", artist: "Asake", song: "Gratitude", term: "asake gratitude" },
  ],
  [
    { id: "s5", artist: "Rema", song: "Calm Down", term: "rema calm down" },
    { id: "s6", artist: "CKay", song: "Love Nwantiti (Remix)", term: "ckay love nwantiti" },
    { id: "s7", artist: "Fireboy DML", song: "Peru", term: "fireboy peru" },
    { id: "s8", artist: "Ayra Starr", song: "Rush", term: "ayra star rush" },
  ],
  [
    { id: "s9", artist: "Omah Lay", song: "Soso", term: "omah lay soso" },
    { id: "s10", artist: "Tems", song: "Free Mind", term: "tems free mind" },
    { id: "s11", artist: "Kizz Daniel", song: "Buga (Lo Lo Lo)", term: "kizz daniel buga" },
    { id: "s12", artist: "Young Jonn", song: "Dada", term: "young jonn dada" },
  ],
  [
    { id: "s13", artist: "Shallipopi", song: "Obapluto", term: "shallipopi" },
    { id: "s14", artist: "BNXN", song: "GWAGWALADA", term: "bnxn gwagwalada" },
    { id: "s15", artist: "Victony", song: "Soweto", term: "victony soweto" },
    { id: "s16", artist: "Ruger", song: "Bounce", term: "ruger bounce" },
  ],
];

export function musicSongIds(day: string): Song[] {
  const idx = Math.abs(hashDay(day)) % MUSIC_SETS.length;
  return MUSIC_SETS[idx];
}

function hashDay(day: string): number {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h << 5) - h + day.charCodeAt(i);
  return h;
}
