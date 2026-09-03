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

export const MUSIC_SETS = [
  ["burnaboy", "davido", "wizkid", "rema"],
  ["asake", "ayra", "omah", "fireboy"],
  ["kizz", "ladipoe", "tiwa", "simi"],
  ["sosmusic", "timaya", "phyno", "joeboy"],
];

export function musicSongIds(day: string): string[] {
  const idx = Math.abs(hashDay(day)) % MUSIC_SETS.length;
  return MUSIC_SETS[idx];
}

function hashDay(day: string): number {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h << 5) - h + day.charCodeAt(i);
  return h;
}
