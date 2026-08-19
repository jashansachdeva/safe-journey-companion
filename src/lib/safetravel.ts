import { useCallback, useEffect, useRef, useState } from "react";

export type Contact = { id: string; name: string; phone: string; relation: string };
export type Journey = { from: string; to: string; endsAt: number; minutes: number } | null;

const C_KEY = "safetravel.contacts";
const J_KEY = "safetravel.journey";

export const SAMPLE_CONTACTS: Contact[] = [
  { id: "1", name: "Priya Sharma", phone: "+919876543210", relation: "Sister" },
  { id: "2", name: "Aditi Rao", phone: "+919812345678", relation: "Best friend" },
];

export const SAFETY_TIPS = [
  "Share your live location with a trusted contact before you leave.",
  "Prefer well-lit, busy routes — avoid shortcuts through empty streets.",
  "Keep your phone charged and carry a small power bank.",
  "Sit behind the driver and verify the vehicle number before boarding.",
  "Trust your instincts — if something feels off, move to a public place.",
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  useEffect(() => {
    const stored = read<Contact[] | null>(C_KEY, null);
    setContacts(stored ?? SAMPLE_CONTACTS);
    if (!stored) localStorage.setItem(C_KEY, JSON.stringify(SAMPLE_CONTACTS));
  }, []);
  const save = useCallback((next: Contact[]) => {
    setContacts(next);
    localStorage.setItem(C_KEY, JSON.stringify(next));
  }, []);
  return { contacts, save };
}

export function useJourney() {
  const [journey, setJourney] = useState<Journey>(null);
  useEffect(() => setJourney(read<Journey>(J_KEY, null)), []);
  const save = useCallback((next: Journey) => {
    setJourney(next);
    if (next) localStorage.setItem(J_KEY, JSON.stringify(next));
    else localStorage.removeItem(J_KEY);
  }, []);
  return { journey, save };
}

const LAST_CHECKIN_KEY = "safetravel.lastCheckIn";
const SAFETY_PHRASE_KEY = "safetravel.safetyPhrase";

export function useLastCheckIn() {
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  useEffect(() => {
    setLastCheckIn(read<number | null>(LAST_CHECKIN_KEY, null));
  }, []);
  const recordCheckIn = useCallback(() => {
    const now = Date.now();
    setLastCheckIn(now);
    localStorage.setItem(LAST_CHECKIN_KEY, JSON.stringify(now));
  }, []);
  return { lastCheckIn, recordCheckIn };
}

export function useSafetyPhrase() {
  const [phrase, setPhrase] = useState("Can you call me?");
  useEffect(() => {
    setPhrase(read<string>(SAFETY_PHRASE_KEY, "Can you call me?"));
  }, []);
  const save = useCallback((next: string) => {
    setPhrase(next);
    localStorage.setItem(SAFETY_PHRASE_KEY, JSON.stringify(next));
  }, []);
  return { phrase, setPhrase: save };
}


export type Coords = { lat: number; lng: number; accuracy: number; at: number };

export function useLiveLocation(active: boolean) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !navigator.geolocation) return;
    idRef.current = navigator.geolocation.watchPosition(
      (p) =>
        setCoords({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: Math.round(p.coords.accuracy),
          at: Date.now(),
        }),
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    return () => {
      if (idRef.current !== null) navigator.geolocation.clearWatch(idRef.current);
    };
  }, [active]);

  return { coords, error };
}

export const mapsLink = (c: Coords) => `https://maps.google.com/?q=${c.lat.toFixed(5)},${c.lng.toFixed(5)}`;

export function buildMessage(kind: "sos" | "checkin" | "missed", coords: Coords | null, to?: string) {
  const loc = coords ? `My live location: ${mapsLink(coords)} (±${coords.accuracy}m)` : "Live location unavailable.";
  if (kind === "sos") return `🚨 SOS from SafeTravel. I need help right now. ${loc}`;
  if (kind === "missed")
    return `⚠️ SafeTravel alert: I missed my safety check-in${to ? ` on my way to ${to}` : ""}. Please check on me. ${loc}`;
  return `✅ SafeTravel: I've reached safely${to ? ` at ${to}` : ""}. ${loc}`;
}

export const smsHref = (phone: string, body: string) =>
  `sms:${phone}${/(iPhone|iPad|Mac)/.test(typeof navigator !== "undefined" ? navigator.userAgent : "") ? "&" : "?"}body=${encodeURIComponent(body)}`;

export function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}
