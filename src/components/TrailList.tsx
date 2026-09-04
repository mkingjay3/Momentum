"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, MapPin, Bike } from "lucide-react";

interface Trail {
  id: string;
  name: string;
  difficulty: string;
  length_miles: number;
  surface: string;
  region: string;
  description: string;
}

const NK_DISPLAY = { fontFamily: "Helvetica Now Display Medium, Helvetica, Arial, sans-serif" };
const NK_TEXT = { fontFamily: "Helvetica Now Text, Helvetica, Arial, sans-serif" };
const NK_MED = { fontFamily: "Helvetica Now Text Medium, Helvetica, Arial, sans-serif" };

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#007d48",
  Moderate: "#3d7a62",
  Hard: "#1b4332",
};

function DifficultyChip({ difficulty }: { difficulty: string }) {
  const color = DIFFICULTY_COLOR[difficulty] ?? "#3d7a62";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-[500]"
      style={{ color, border: `1px solid ${color}`, borderRadius: "9999px", ...NK_MED }}
    >
      {difficulty}
    </span>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 text-[12px] font-[500]"
      style={{ backgroundColor: "#f0f7f4", color: "#3d7a62", borderRadius: "9999px", ...NK_MED }}
    >
      {children}
    </span>
  );
}

function TrailModal({ trail, onClose }: { trail: Trail; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full mx-4 p-8 max-w-md"
        style={{ backgroundColor: "#ffffff", borderRadius: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2
              className="text-[24px] font-[500] leading-[1.2] mb-1"
              style={{ color: "#1b4332", ...NK_DISPLAY }}
            >
              {trail.name}
            </h2>
            <p
              className="flex items-center gap-1 text-[12px] font-[500]"
              style={{ color: "#3d7a62", ...NK_MED }}
            >
              <MapPin size={11} /> {trail.region}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 transition-opacity hover:opacity-60"
            style={{ color: "#1b4332", backgroundColor: "#f0f7f4", borderRadius: "9999px", border: "none" }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <DifficultyChip difficulty={trail.difficulty} />
          <MetaChip>{trail.surface}</MetaChip>
          <MetaChip><Bike size={10} /> {trail.length_miles} mi</MetaChip>
        </div>

        <p className="text-[14px] leading-[1.6]" style={{ color: "#2d5a45", ...NK_TEXT }}>
          {trail.description}
        </p>
      </div>
    </div>
  );
}

const DIFFICULTIES = ["All", "Easy", "Moderate", "Hard"];
const SURFACES = ["All", "Paved", "Gravel", "Dirt"];

function FilterChips({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="px-4 py-2 text-[12px] font-[500] transition-colors"
            style={{
              backgroundColor: active ? "#1b4332" : "#ffffff",
              color: active ? "#ffffff" : "#1b4332",
              border: `1px solid ${active ? "#1b4332" : "#b7d5c8"}`,
              borderRadius: "9999px",
              ...NK_MED,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function TrailList() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("All");
  const [surface, setSurface] = useState("All");
  const [selected, setSelected] = useState<Trail | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("trails").select("*").then(({ data }) => {
      setTrails((data as Trail[]) ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = trails.filter(
    (t) =>
      (difficulty === "All" || t.difficulty === difficulty) &&
      (surface === "All" || t.surface === surface)
  );

  return (
    <div className="px-6 py-12 max-w-4xl mx-auto">
      <h1
        className="text-[32px] font-[500] leading-[1.2] mb-8"
        style={{ color: "#1b4332", ...NK_DISPLAY }}
      >
        Explore Trails
      </h1>

      <div
        className="flex flex-col sm:flex-row gap-6 mb-10"
        style={{ borderBottom: "1px solid #b7d5c8", paddingBottom: "24px" }}
      >
        <div className="space-y-2">
          <p className="text-[11px] font-[500] uppercase tracking-widest" style={{ color: "#3d7a62", ...NK_MED }}>
            Difficulty
          </p>
          <FilterChips options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-[500] uppercase tracking-widest" style={{ color: "#3d7a62", ...NK_MED }}>
            Surface
          </p>
          <FilterChips options={SURFACES} value={surface} onChange={setSurface} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse" style={{ backgroundColor: "#f0f7f4" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bike size={36} className="mx-auto mb-4" style={{ color: "#b7d5c8" }} />
          <p className="text-[14px]" style={{ color: "#3d7a62", ...NK_TEXT }}>
            No trails match the selected filters.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-px"
          style={{ backgroundColor: "#b7d5c8", border: "1px solid #b7d5c8" }}
        >
          {filtered.map((trail) => (
            <button
              key={trail.id}
              onClick={() => setSelected(trail)}
              className="text-left p-5 transition-colors"
              style={{ backgroundColor: "#ffffff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f7f4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[16px] font-[500] leading-[1.4] mb-1" style={{ color: "#1b4332", ...NK_MED }}>
                    {trail.name}
                  </p>
                  <p className="flex items-center gap-1 text-[12px]" style={{ color: "#3d7a62", ...NK_TEXT }}>
                    <MapPin size={10} /> {trail.region}
                  </p>
                </div>
                <DifficultyChip difficulty={trail.difficulty} />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <MetaChip>{trail.surface}</MetaChip>
                <MetaChip><Bike size={10} /> {trail.length_miles} mi</MetaChip>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && <TrailModal trail={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}