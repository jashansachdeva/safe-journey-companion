import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  Navigation,
  Users,
  ShieldCheck,
  MapPin,
  Phone,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Siren,
  Lightbulb,
} from "lucide-react";
import {
  SAFETY_TIPS,
  buildMessage,
  fmt,
  mapsLink,
  smsHref,
  useContacts,
  useJourney,
  useLiveLocation,
  type Contact,
} from "@/lib/safetravel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeTravel — Safety Companion for Solo Women Travelers" },
      {
        name: "description",
        content:
          "SafeTravel is a mobile-first safety companion: journey timers, live location sharing, trusted contacts and one-tap emergency help.",
      },
      { property: "og:title", content: "SafeTravel — Safety Companion for Solo Women Travelers" },
      {
        property: "og:description",
        content: "Journey safety timer, live location sharing and one-tap emergency alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Tab = "home" | "journey" | "contacts";

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [sos, setSos] = useState(false);
  const { contacts, save: saveContacts } = useContacts();
  const { journey, save: saveJourney } = useJourney();
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const remaining = journey ? journey.endsAt - now : 0;
  const missed = !!journey && remaining <= 0;
  const { coords, error: geoError } = useLiveLocation(!!journey || sos);

  const status = sos ? "emergency" : missed ? "warning" : journey ? "active" : "safe";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <Header status={status} />

      <main className="flex-1 space-y-5 px-4 pb-28 pt-4">
        {sos ? (
          <Emergency
            contacts={contacts}
            coords={coords}
            onCancel={() => {
              setSos(false);
              setToast("Emergency cancelled. Contacts notified you are okay.");
            }}
          />
        ) : tab === "home" ? (
          <HomeTab
            contacts={contacts}
            journey={journey}
            remaining={remaining}
            missed={missed}
            onStart={() => setTab("journey")}
            onContacts={() => setTab("contacts")}
          />
        ) : tab === "journey" ? (
          <JourneyTab
            journey={journey}
            remaining={remaining}
            missed={missed}
            coords={coords}
            geoError={geoError}
            contacts={contacts}
            onStart={(j) => {
              saveJourney(j);
              setToast("Journey started. Live location is on.");
            }}
            onSafe={() => {
              saveJourney(null);
              setToast("Check-in confirmed. You are marked safe.");
            }}
            onExtend={(mins) => {
              if (journey) saveJourney({ ...journey, endsAt: Date.now() + mins * 60000 });
            }}
            onSos={() => setSos(true)}
          />
        ) : (
          <ContactsTab contacts={contacts} onSave={saveContacts} />
        )}
      </main>

      {!sos && (
        <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-md items-center justify-around border-t border-border bg-card/95 px-2 py-2 backdrop-blur">
          {(
            [
              ["home", Home, "Home"],
              ["journey", Navigation, "Journey"],
              ["contacts", Users, "Contacts"],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex min-w-20 flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
                tab === key ? "bg-accent text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-30 w-[88%] max-w-sm -translate-x-1/2 rounded-xl bg-foreground px-4 py-3 text-center text-sm text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function Header({ status }: { status: string }) {
  const label =
    status === "emergency"
      ? "Emergency mode"
      : status === "warning"
        ? "Check-in missed"
        : status === "active"
          ? "Journey active"
          : "You are safe";
  const dot =
    status === "emergency" ? "bg-destructive" : status === "warning" ? "bg-warning" : status === "active" ? "bg-primary" : "bg-safe";

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 text-primary-foreground"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight">SafeTravel</h1>
          <p className="text-[11px] opacity-80">Your travel safety companion</p>
        </div>
      </div>
      <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
        <span className={`h-2 w-2 animate-pulse rounded-full ${dot}`} />
        {label}
      </span>
    </header>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-4 ${className}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </section>
  );
}

function HomeTab({
  contacts,
  journey,
  remaining,
  missed,
  onStart,
  onContacts,
}: {
  contacts: Contact[];
  journey: ReturnType<typeof useJourney>["journey"];
  remaining: number;
  missed: boolean;
  onStart: () => void;
  onContacts: () => void;
}) {
  return (
    <>
      <Card className="text-center">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
            missed ? "bg-warning/15 text-warning" : "bg-safe/15 text-safe"
          }`}
        >
          <ShieldCheck className="h-12 w-12" />
        </div>
        <h2 className="mt-3 text-2xl font-bold">{missed ? "Check-In Missed" : journey ? "Journey Active" : "You are Safe"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {journey ? `${journey.from} → ${journey.to}` : "No active journey. Start one before you travel."}
        </p>
        {journey && !missed && (
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-primary">{fmt(remaining)}</p>
        )}
      </Card>

      <button
        onClick={onStart}
        className="w-full rounded-2xl px-6 py-5 text-lg font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}
      >
        {journey ? "Open Active Journey" : "Start Safe Journey"}
      </button>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Trusted contacts</h3>
          <button onClick={onContacts} className="text-sm font-semibold text-primary">
            Manage
          </button>
        </div>
        <div className="space-y-2">
          {contacts.length === 0 && <p className="text-sm text-muted-foreground">No contacts yet.</p>}
          {contacts.map((c) => (
            <ContactRow key={c.id} c={c} />
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Lightbulb className="h-4 w-4 text-warning" /> Safety tips
        </h3>
        <ol className="space-y-2">
          {SAFETY_TIPS.map((t, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}

function ContactRow({ c }: { c: Contact }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {c.name.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{c.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {c.relation} · {c.phone}
        </p>
      </div>
      <a
        href={`tel:${c.phone}`}
        aria-label={`Call ${c.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-safe text-safe-foreground"
      >
        <Phone className="h-4 w-4" />
      </a>
    </div>
  );
}

function LocationCard({ coords, geoError }: { coords: ReturnType<typeof useLiveLocation>["coords"]; geoError: string | null }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MapPin className="h-4 w-4 text-primary" /> Live location
        {coords && <span className="ml-auto flex items-center gap-1 text-xs font-medium text-safe">● Live</span>}
      </div>
      {coords ? (
        <>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} · ±{coords.accuracy}m
          </p>
          <a href={mapsLink(coords)} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary underline">
            Open in Maps
          </a>
        </>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">
          {geoError ? `Location unavailable (${geoError})` : "Waiting for GPS permission… demo continues without it."}
        </p>
      )}
    </div>
  );
}

function JourneyTab({
  journey,
  remaining,
  missed,
  coords,
  geoError,
  contacts,
  onStart,
  onSafe,
  onExtend,
  onSos,
}: {
  journey: ReturnType<typeof useJourney>["journey"];
  remaining: number;
  missed: boolean;
  coords: ReturnType<typeof useLiveLocation>["coords"];
  geoError: string | null;
  contacts: Contact[];
  onStart: (j: NonNullable<ReturnType<typeof useJourney>["journey"]>) => void;
  onSafe: () => void;
  onExtend: (mins: number) => void;
  onSos: () => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mins, setMins] = useState("30");

  if (!journey) {
    return (
      <Card className="space-y-4">
        <h2 className="text-lg font-bold">Start a safe journey</h2>
        <Field label="Starting location" value={from} onChange={setFrom} placeholder="e.g. Home, Sector 12" />
        <Field label="Destination" value={to} onChange={setTo} placeholder="e.g. Central Station" />
        <Field label="Expected journey time (minutes)" value={mins} onChange={setMins} type="number" placeholder="30" />
        <LocationCard coords={coords} geoError={geoError} />
        <button
          disabled={!from.trim() || !to.trim() || !(Number(mins) > 0)}
          onClick={() => onStart({ from: from.trim(), to: to.trim(), minutes: Number(mins), endsAt: Date.now() + Number(mins) * 60000 })}
          className="w-full rounded-2xl px-6 py-4 text-lg font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-40"
          style={{ background: "var(--gradient-hero)" }}
        >
          Start Journey
        </button>
      </Card>
    );
  }

  const pct = Math.max(0, Math.min(100, (remaining / (journey.minutes * 60000)) * 100));
  const msg = buildMessage(missed ? "missed" : "checkin", coords, journey.to);

  return (
    <>
      <Card className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {missed ? "Check-In Missed" : "Journey Active"}
        </p>
        <h2 className="mt-1 text-xl font-bold">{journey.to}</h2>
        <p className="text-sm text-muted-foreground">from {journey.from}</p>
        <p
          className={`mt-4 font-mono text-5xl font-bold tabular-nums ${missed ? "text-destructive" : "text-primary"}`}
        >
          {missed ? "00:00" : fmt(remaining)}
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${missed ? "bg-destructive" : pct < 25 ? "bg-warning" : "bg-safe"}`}
            style={{ width: `${missed ? 100 : pct}%` }}
          />
        </div>
        {missed && (
          <p className="mt-3 rounded-xl bg-warning/15 px-3 py-2 text-sm font-medium text-foreground">
            ⚠️ You didn't check in on time. Notify a trusted contact or open Emergency Help.
          </p>
        )}
      </Card>

      <Card className="space-y-3">
        <LocationCard coords={coords} geoError={geoError} />
        {contacts[0] && (
          <a
            href={smsHref(contacts[0].phone, msg)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary"
          >
            <MessageSquare className="h-4 w-4" /> Text live location to {contacts[0].name}
          </a>
        )}
        <p className="rounded-xl bg-muted px-3 py-2 text-xs italic text-muted-foreground">"{msg}"</p>
      </Card>

      <button
        onClick={onSafe}
        className="w-full rounded-2xl bg-safe px-6 py-5 text-lg font-bold text-safe-foreground transition-transform active:scale-[0.98]"
      >
        I'm Safe
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onExtend(15)} className="rounded-2xl border border-border bg-card py-3 text-sm font-semibold">
          +15 min
        </button>
        <button onClick={() => onExtend(30)} className="rounded-2xl border border-border bg-card py-3 text-sm font-semibold">
          +30 min
        </button>
      </div>
      <button
        onClick={onSos}
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-5 text-lg font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        style={{ background: "var(--gradient-sos)" }}
      >
        <Siren className="h-5 w-5" /> I Need Help
      </button>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function Emergency({
  contacts,
  coords,
  onCancel,
}: {
  contacts: Contact[];
  coords: ReturnType<typeof useLiveLocation>["coords"];
  onCancel: () => void;
}) {
  const msg = buildMessage("sos", coords);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 text-center text-primary-foreground" style={{ background: "var(--gradient-sos)" }}>
        <Siren className="mx-auto h-12 w-12 animate-pulse" />
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight">EMERGENCY MODE</h2>
        <p className="mt-1 text-sm opacity-90">Alert prepared for your trusted contacts.</p>
        <p className="mt-3 rounded-xl bg-black/20 px-3 py-2 text-left text-sm">{msg}</p>
      </div>

      <Card>
        <LocationCard coords={coords} geoError={null} />
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">Trusted contacts</h3>
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
            </div>
            <a href={smsHref(c.phone, msg)} className="rounded-full bg-primary p-2.5 text-primary-foreground" aria-label="Send SOS text">
              <MessageSquare className="h-4 w-4" />
            </a>
            <a href={`tel:${c.phone}`} className="rounded-full bg-safe p-2.5 text-safe-foreground" aria-label="Call">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        ))}
      </Card>

      <a
        href="tel:112"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive px-6 py-5 text-lg font-bold text-destructive-foreground"
      >
        <Phone className="h-5 w-5" /> Call Emergency Services (112)
      </a>
      <button onClick={onCancel} className="w-full rounded-2xl border border-border bg-card px-6 py-4 font-semibold">
        Cancel Emergency
      </button>
    </div>
  );
}

function ContactsTab({ contacts, onSave }: { contacts: Contact[]; onSave: (c: Contact[]) => void }) {
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", relation: "" });
  const valid = useMemo(() => form.name.trim() && form.phone.trim(), [form]);

  const submit = () => {
    if (!valid) return;
    if (editing) {
      onSave(contacts.map((c) => (c.id === editing.id ? { ...editing, ...form } : c)));
    } else {
      onSave([...contacts, { id: String(Date.now()), ...form, relation: form.relation || "Contact" }]);
    }
    setEditing(null);
    setForm({ name: "", phone: "", relation: "" });
  };

  return (
    <>
      <Card className="space-y-3">
        <h2 className="text-lg font-bold">{editing ? "Edit contact" : "Add trusted contact"}</h2>
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Full name" />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91…" type="tel" />
        <Field
          label="Relation"
          value={form.relation}
          onChange={(v) => setForm({ ...form, relation: v })}
          placeholder="Sister, friend…"
        />
        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={!valid}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-primary-foreground disabled:opacity-40"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Plus className="h-4 w-4" /> {editing ? "Save changes" : "Add contact"}
          </button>
          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setForm({ name: "", phone: "", relation: "" });
              }}
              className="rounded-xl border border-border px-4 py-3 font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">Your contacts ({contacts.length})</h3>
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {c.relation} · {c.phone}
              </p>
            </div>
            <a href={`tel:${c.phone}`} className="rounded-full bg-safe p-2 text-safe-foreground" aria-label="Call">
              <Phone className="h-4 w-4" />
            </a>
            <button
              onClick={() => {
                setEditing(c);
                setForm({ name: c.name, phone: c.phone, relation: c.relation });
              }}
              className="rounded-full bg-accent p-2 text-primary"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSave(contacts.filter((x) => x.id !== c.id))}
              className="rounded-full bg-destructive/10 p-2 text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </Card>
    </>
  );
}
