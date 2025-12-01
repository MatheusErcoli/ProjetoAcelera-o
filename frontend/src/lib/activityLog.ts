export interface ActivityEntry {
  id: string;
  type: string;
  message: string;
  time: string; // human readable
  status?: string | null;
  createdAt: string; // ISO
}

const STORAGE_KEY = "admin_activities";
const MAX_ENTRIES = 50;

function nowHuman() {
  return new Date().toLocaleString("pt-BR");
}

export function getActivities(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActivityEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Failed to read admin activities from localStorage", e);
    return [];
  }
}

export function addActivity(payload: { type: string; message: string; status?: string | null }) {
  try {
    const entry: ActivityEntry = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      type: payload.type,
      message: payload.message,
      status: payload.status ?? null,
      time: nowHuman(),
      createdAt: new Date().toISOString(),
    };

    const current = getActivities();
    current.unshift(entry);
    // limit size
    const next = current.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // broadcast to other parts of the app
    try {
      window.dispatchEvent(new CustomEvent("admin_activity", { detail: entry }));
    } catch (e) {
      // ignore
    }

    return entry;
  } catch (e) {
    console.error("Failed to add admin activity", e);
    return null;
  }
}

export function subscribeActivity(cb: (entry: ActivityEntry) => void) {
  const handler = (e: Event) => {
    // @ts-ignore - CustomEvent
    const detail = (e as CustomEvent).detail as ActivityEntry | undefined;
    if (detail) cb(detail);
  };

  window.addEventListener("admin_activity", handler as EventListener);

  return () => window.removeEventListener("admin_activity", handler as EventListener);
}
