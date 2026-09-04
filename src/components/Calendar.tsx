"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { EventClickArg, EventInput } from "@fullcalendar/core";
import { X, MapPin, CalendarDays, Tag, AlignLeft, CheckCircle, Circle, Plus, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"] as const;
type Level = typeof LEVELS[number];

const LEVEL_STYLE: Record<Level, { dot: string; text: string; bg: string }> = {
  "Beginner":     { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  "Intermediate": { dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50"   },
  "Advanced":     { dot: "bg-rose-500",    text: "text-rose-700",    bg: "bg-rose-50"    },
  "All Levels":   { dot: "bg-sky-500",     text: "text-sky-700",     bg: "bg-sky-50"     },
};

interface SelectedEvent {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  description: string;
  location: string;
  level: Level;
}

interface NewEventForm {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
  level: Level;
}

const emptyForm: NewEventForm = { title: "", startDate: "", endDate: "", description: "", location: "", level: "All Levels" };

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function LevelPill({ level }: { level: Level }) {
  const s = LEVEL_STYLE[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {level}
    </span>
  );
}

function toEventInput(e: Record<string, unknown>): EventInput {
  return {
    id: String(e.id),
    title: e.title as string,
    start: e.start as string,
    end: (e.end as string) ?? undefined,
    allDay: true,
    extendedProps: { description: e.description, location: e.location, level: e.level },
  };
}

export default function Calendar() {
  const supabase = createClient();
  const [events, setEvents] = useState<EventInput[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<SelectedEvent | null>(null);
  const [signedUpIds, setSignedUpIds] = useState<Set<string>>(new Set());
  const [signedUp, setSignedUp] = useState<SelectedEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewEventForm>(emptyForm);
  const [error, setError] = useState("");
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    supabase.from("events").select("*").then(({ data }) => {
      if (data) setEvents(data.map(toEventInput));
    });

    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      if (!u) return;
      supabase
        .from("event_signups")
        .select("event_id, events(*)")
        .eq("user_id", u.id)
        .then(({ data: signups }) => {
          if (!signups) return;
          const ids = new Set(signups.map((s) => String(s.event_id)));
          setSignedUpIds(ids);
          setSignedUp(
            signups
              .filter((s) => s.events)
              .map((s) => {
                const e = s.events as Record<string, unknown>;
                return {
                  id: String(e.id),
                  title: e.title as string,
                  start: e.start as string,
                  end: (e.end as string) ?? null,
                  description: (e.description as string) ?? "",
                  location: (e.location as string) ?? "",
                  level: (e.level as Level) ?? "All Levels",
                };
              })
          );
        });
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => calendarRef.current?.getApi().updateSize(), 16);
    const cleanup = setTimeout(() => clearInterval(interval), 320);
    return () => { clearInterval(interval); clearTimeout(cleanup); };
  }, [selected]);

  const handleEventClick = (info: EventClickArg) => setSelected({
    id: info.event.id,
    title: info.event.title,
    start: info.event.startStr,
    end: info.event.endStr || null,
    description: (info.event.extendedProps.description as string) ?? "",
    location: (info.event.extendedProps.location as string) ?? "",
    level: (info.event.extendedProps.level as Level) ?? "All Levels",
  });

  const toggleSignUp = async (event: SelectedEvent) => {
    if (!user) return;
    const alreadySignedUp = signedUpIds.has(event.id);

    if (alreadySignedUp) {
      await supabase.from("event_signups").delete()
        .eq("event_id", Number(event.id)).eq("user_id", user.id);
      setSignedUpIds((prev) => { const next = new Set(prev); next.delete(event.id); return next; });
      setSignedUp((prev) => prev.filter((e) => e.id !== event.id));
    } else {
      await supabase.from("event_signups").insert({ event_id: Number(event.id), user_id: user.id });
      setSignedUpIds((prev) => new Set(prev).add(event.id));
      setSignedUp((prev) => [...prev, event]);
    }
  };

  const handleAddEvent = async () => {
    setError("");
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.startDate) return setError("Start date is required.");
    if (new Date(form.startDate) < new Date()) return setError("Start date must be in the future.");
    if (form.endDate && new Date(form.endDate) < new Date(form.startDate))
      return setError("End date must be after the start date.");

    const { data, error: insertError } = await supabase.from("events").insert({
      title: form.title.trim(),
      start: form.startDate,
      end: form.endDate || null,
      description: form.description.trim(),
      location: form.location.trim(),
      level: form.level,
    }).select().single();

    if (insertError) return setError(insertError.message);
    setEvents((prev) => [...prev, toEventInput(data)]);
    setForm(emptyForm);
    setShowModal(false);
  };

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-eco-primary">Upcoming Events</h1>
        {user && (
          <button onClick={() => { setShowModal(true); setError(""); setForm(emptyForm); }}
            className="btn btn-primary btn-sm gap-2">
            <Plus size={15} /> Add Event
          </button>
        )}
      </div>

      <div className="flex gap-6 items-start">
        <div className="card flex-1 bg-white border border-base-300 shadow-sm p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth listMonth" }}
            events={events}
            height="auto"
            eventClick={handleEventClick}
          />
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${selected ? "w-72 opacity-100" : "w-0 opacity-0 pointer-events-none"}`}>
          {selected && (
            <div className="w-72 bg-white border border-base-300 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-eco-primary px-5 py-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-white font-semibold text-sm leading-snug pr-2">{selected.title}</h2>
                  <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white transition mt-0.5">
                    <X size={15} />
                  </button>
                </div>
                <div className="mt-2"><LevelPill level={selected.level} /></div>
              </div>

              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <CalendarDays size={14} className="mt-0.5 shrink-0 text-eco-secondary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-eco-secondary mb-0.5">Date</p>
                    <p className="text-gray-700">{formatDate(selected.start)}</p>
                    {selected.end && <p className="text-gray-500 text-xs mt-0.5">Until {formatDate(selected.end)}</p>}
                  </div>
                </div>

                {selected.location && (
                  <div className="flex items-start gap-2.5">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-eco-secondary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-eco-secondary mb-0.5">Location</p>
                      <p className="text-gray-700">{selected.location}</p>
                    </div>
                  </div>
                )}

                {selected.description && (
                  <div className="flex items-start gap-2.5">
                    <AlignLeft size={14} className="mt-0.5 shrink-0 text-eco-secondary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-eco-secondary mb-0.5">About</p>
                      <p className="text-gray-600 leading-relaxed">{selected.description}</p>
                    </div>
                  </div>
                )}

                {user && (
                  <div className="pt-1">
                    <button onClick={() => toggleSignUp(selected)}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition
                        ${signedUpIds.has(selected.id)
                          ? "bg-eco-surface text-eco-primary border border-eco-secondary hover:bg-eco-secondary/20"
                          : "bg-eco-primary text-white hover:bg-eco-secondary"}`}>
                      {signedUpIds.has(selected.id)
                        ? <><CheckCircle size={15} /> Signed Up</>
                        : <><Circle size={15} /> Sign Up</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {signedUp.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-5">
            <Bookmark size={18} className="text-eco-primary" />
            <h2 className="text-lg font-bold text-eco-primary">My Events</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {signedUp.map((event) => (
              <div key={event.id} className="bg-white border border-base-300 rounded-xl shadow-sm overflow-hidden">
                <div className="h-1 bg-eco-primary" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-eco-primary text-sm leading-snug pr-2">{event.title}</h3>
                    <button onClick={() => toggleSignUp(event)}
                      className="text-eco-secondary hover:text-eco-primary transition shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                  <LevelPill level={event.level} />
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <CalendarDays size={12} className="text-eco-secondary" />
                      {formatDate(event.start)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={12} className="text-eco-secondary" />
                        {event.location}
                      </div>
                    )}
                    {event.description && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-400 pt-0.5">
                        <Tag size={12} className="text-eco-secondary mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{event.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal modal-open" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-eco-primary">New Event</h3>
              <button onClick={() => setShowModal(false)} className="text-eco-secondary hover:text-eco-primary transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="form-control w-full">
                <div className="label"><span className="label-text font-semibold">Title <span className="text-error">*</span></span></div>
                <input type="text" placeholder="Event name" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input input-bordered bg-base-200 w-full" />
              </label>

              <div className="flex gap-3">
                <label className="form-control flex-1">
                  <div className="label"><span className="label-text font-semibold">Start <span className="text-error">*</span></span></div>
                  <input type="date" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="input input-bordered bg-base-200 w-full" />
                </label>
                <label className="form-control flex-1">
                  <div className="label"><span className="label-text font-semibold">End</span><span className="label-text-alt text-eco-secondary">optional</span></div>
                  <input type="date" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="input input-bordered bg-base-200 w-full" />
                </label>
              </div>

              <div className="flex gap-3">
                <label className="form-control flex-1">
                  <div className="label"><span className="label-text font-semibold">Location</span><span className="label-text-alt text-eco-secondary">optional</span></div>
                  <input type="text" placeholder="Room 204, Online…" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="input input-bordered bg-base-200 w-full" />
                </label>
                <label className="form-control w-36">
                  <div className="label"><span className="label-text font-semibold">Level</span></div>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as Level })}
                    className="select select-bordered bg-base-200 w-full">
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </label>
              </div>

              <label className="form-control w-full">
                <div className="label"><span className="label-text font-semibold">Description</span><span className="label-text-alt text-eco-secondary">optional</span></div>
                <textarea placeholder="Add details…" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className="textarea textarea-bordered bg-base-200 resize-none w-full" />
              </label>

              {error && <p className="text-error text-xs">{error}</p>}

              <div className="modal-action mt-2">
                <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button onClick={handleAddEvent} className="btn btn-primary">Add Event</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
