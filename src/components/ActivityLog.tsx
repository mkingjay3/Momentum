"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Plus, X } from "lucide-react";

interface Ride {
  id: string;
  title: string;
  distance: number;
  date: string;
  created_at: string;
}

const supabase = createClient();

// WCAG: #1b4332 on #ffffff 11.3:1 ✓ | #2d5a45 8.4:1 ✓ | #3d7a62 5.4:1 ✓

const NK_DISPLAY = { fontFamily: "Helvetica Now Display Medium, Helvetica, Arial, sans-serif" };
const NK_TEXT = { fontFamily: "Helvetica Now Text, Helvetica, Arial, sans-serif" };
const NK_MED = { fontFamily: "Helvetica Now Text Medium, Helvetica, Arial, sans-serif" };

const inputStyle: React.CSSProperties = {
  backgroundColor: "#f0f7f4",
  color: "#1b4332",
  borderRadius: "24px",
  border: "none",
  outline: "none",
  fontSize: "14px",
  fontWeight: 400,
  width: "100%",
  padding: "10px 16px",
  ...NK_TEXT,
};

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const [y, m, day] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function fetchRides(user: User): Promise<Ride[]> {
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .eq("author_id", user.id)
    .order("date", { ascending: false });
  return (data as Ride[]) ?? [];
}

export default function ActivityLog() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [title, setTitle] = useState("");
  const [distance, setDistance] = useState("");
  const [date, setDate] = useState(localToday());
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      setAuthChecked(true);
      if (!u) {
        router.push("/signin?redirect=/activitylog");
        return;
      }
      fetchRides(u).then(setRides);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) { router.push("/signin?redirect=/activitylog"); return; }
      fetchRides(u).then(setRides);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleAddRide = async () => {
    if (!user || !title || !distance || !date) return;
    if (date > localToday()) { alert("Cannot log rides for future dates."); return; }
    setAdding(true);
    const { error } = await supabase
      .from("activity_log")
      .insert([{ title, distance: parseFloat(distance), date, author_id: user.id }]);
    if (error) { alert(error.message); setAdding(false); return; }
    setTitle("");
    setDistance("");
    setDate(localToday());
    setShowForm(false);
    setRides(await fetchRides(user));
    setAdding(false);
  };

  if (!authChecked) return null;

  return (
    <div className="px-6 py-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h1
          className="text-[32px] font-medium leading-[1.2]"
          style={{ color: "#1b4332", ...NK_DISPLAY }}
        >
          Activity Log
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 h-12 text-[14px] font-medium transition-opacity hover:opacity-75"
          style={{
            backgroundColor: showForm ? "#f0f7f4" : "#1b4332",
            color: showForm ? "#1b4332" : "#ffffff",
            borderRadius: "9999px",
            border: "none",
            ...NK_MED,
          }}
        >
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Ride</>}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 space-y-4" style={{ backgroundColor: "#f0f7f4" }}>
          <p className="text-[12px] font-medium uppercase tracking-widest" style={{ color: "#3d7a62", ...NK_MED }}>
            New Ride
          </p>
          <input type="text" placeholder="Ride title" value={title}
            onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Distance (miles)" value={distance}
            onChange={(e) => setDistance(e.target.value)} style={inputStyle} />
          <input type="date" value={date} max={localToday()}
            onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          <button
            onClick={handleAddRide}
            disabled={adding || !title || !distance || !date}
            className="px-6 h-12 text-[14px] font-medium transition-opacity hover:opacity-75 disabled:opacity-40"
            style={{ backgroundColor: "#1b4332", color: "#ffffff", borderRadius: "9999px", border: "none", ...NK_MED }}
          >
            {adding ? "Saving…" : "Save Ride"}
          </button>
        </div>
      )}

      {rides.length === 0 ? (
        <p className="text-center py-16 text-[14px]" style={{ color: "#3d7a62", ...NK_TEXT }}>
          No rides logged yet.
        </p>
      ) : (
        <div style={{ border: "1px solid #b7d5c8" }}>
          <div
            className="grid px-4 py-3"
            style={{ gridTemplateColumns: "1fr 140px 140px", backgroundColor: "#f0f7f4", borderBottom: "1px solid #b7d5c8" }}
          >
            {["Title", "Distance (mi)", "Date"].map((col, i) => (
              <div
                key={col}
                className="text-[11px] font-medium uppercase tracking-widest"
                style={{ color: "#3d7a62", textAlign: i === 0 ? "left" : "center", ...NK_MED }}
              >
                {col}
              </div>
            ))}
          </div>

          <div>
            {rides.map((ride, idx) => (
              <div
                key={ride.id}
                className="grid px-4 py-4 items-center"
                style={{ gridTemplateColumns: "1fr 140px 140px", borderTop: idx === 0 ? "none" : "1px solid #d4ebe3" }}
              >
                <div className="text-[14px] font-medium" style={{ color: "#1b4332", ...NK_MED }}>
                  {ride.title}
                </div>
                <div className="text-[14px] text-center" style={{ color: "#2d5a45", ...NK_TEXT }}>
                  {ride.distance}
                </div>
                <div className="text-[14px] text-center" style={{ color: "#3d7a62", ...NK_TEXT }}>
                  {formatDate(ride.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
