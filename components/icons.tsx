"use client";

export function Icon({ name, cls }: { name: string; cls?: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: cls,
  };
  switch (name) {
    case "home":
      return <svg {...common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>;
    case "wallet":
      return <svg {...common}><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18"/><path d="M16 15h2"/></svg>;
    case "profile":
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>;
    case "share":
      return <svg {...common}><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m8.5 10.5 7-3M8.5 13.5l7 3"/></svg>;
    case "music":
      return <svg {...common}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case "spark":
      return <svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></svg>;
    case "gift":
      return <svg {...common}><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M12 8s-5-1-5-4c0-2 2-2 2 0M12 8s5-1 5-4c0-2-2-2-2 0"/><path d="M5 12v9h14v-9"/></svg>;
    case "withdraw":
      return <svg {...common}><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 19h16"/></svg>;
    case "pen":
      return <svg {...common}><path d="M17 3l4 4L8 20l-5 1 1-5L17 3z"/></svg>;
    case "clipboard":
      return <svg {...common}><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a3 3 0 0 1 6 0"/><path d="M9 10h6M9 14h6M9 18h4"/></svg>;
    case "video":
      return <svg {...common}><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></svg>;
    case "star":
      return <svg {...common}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6L12 17l-5.4 2.6 1-6L3.3 9.4l6-.9L12 3z"/></svg>;
    case "lock":
      return <svg {...common}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
    case "arrow":
      return <svg {...common}><path d="M15 18l-6-6 6-6"/></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>;
  }
}
