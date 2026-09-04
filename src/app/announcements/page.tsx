"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Clock, User } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_username: string;
  created_at: string;
}

// WCAG: #1b4332 on #ffffff 11.3:1 ✓ | #2d5a45 8.4:1 ✓ | #3d7a62 5.4:1 ✓

const STORAGE_KEY = "pendingAnnouncement";

const NK_DISPLAY = { fontFamily: "Helvetica Now Display Medium, Helvetica, Arial, sans-serif" };
const NK_TEXT = { fontFamily: "Helvetica Now Text, Helvetica, Arial, sans-serif" };
const NK_MED = { fontFamily: "Helvetica Now Text Medium, Helvetica, Arial, sans-serif" };

const inputStyle: React.CSSProperties = {
  backgroundColor: "#f0f7f4",
  color: "#1b4332",
  border: "none",
  borderRadius: "24px",
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: 400,
  width: "100%",
  outline: "none",
  ...NK_TEXT,
};

export default function Announcements() {
  const supabase = createClient();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { title: t, content: c } = JSON.parse(saved);
        if (t) setTitle(t);
        if (c) setContent(c);
      } catch { /* ignore malformed */ }
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("Announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handlePost = async () => {
    if (!title || !content) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ title, content }));
      router.push("/signin?redirect=/announcements");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("username").eq("id", user.id).single();
    if (profileError) { alert(profileError.message); return; }

    const { data, error } = await supabase
      .from("Announcements")
      .insert([{ author_id: user.id, author_username: profile.username, title, content }])
      .select();
    if (error) { alert("Only admins can post announcements"); return; }
    if (data) { setAnnouncements([data[0], ...announcements]); setTitle(""); setContent(""); }
  };

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      <h1
        className="text-[32px] font-medium leading-[1.2] mb-10"
        style={{ color: "#1b4332", ...NK_DISPLAY }}
      >
        Announcements
      </h1>

      <div className="mb-10 p-6 space-y-4" style={{ backgroundColor: "#f0f7f4" }}>
        <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "#3d7a62", ...NK_MED }}>
          New Announcement
        </p>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Write your announcement…"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ ...inputStyle, borderRadius: "18px", resize: "vertical", padding: "12px 16px", lineHeight: "1.5" }}
        />
        <button
          onClick={handlePost}
          disabled={!title || !content}
          className="px-6 h-12 text-[14px] font-medium transition-opacity hover:opacity-75 disabled:opacity-40"
          style={{ backgroundColor: "#1b4332", color: "#ffffff", borderRadius: "9999px", border: "none", ...NK_MED }}
        >
          Post Announcement
        </button>
      </div>

      {loading ? (
        <div className="space-y-px" style={{ backgroundColor: "#b7d5c8", border: "1px solid #b7d5c8" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse" style={{ backgroundColor: "#f0f7f4" }} />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-center py-16 text-[14px]" style={{ color: "#3d7a62", ...NK_TEXT }}>
          No announcements yet.
        </p>
      ) : (
        <div style={{ border: "1px solid #b7d5c8" }}>
          {announcements.map((a, idx) => (
            <div
              key={a.id}
              className="p-6"
              style={{ backgroundColor: "#ffffff", borderTop: idx === 0 ? "none" : "1px solid #d4ebe3" }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2
                  className="text-[16px] font-medium leading-normal"
                  style={{ color: "#1b4332", ...NK_MED }}
                >
                  {a.title}
                </h2>
                <span className="shrink-0 flex items-center gap-1 text-[12px]" style={{ color: "#3d7a62", ...NK_TEXT }}>
                  <Clock size={11} />
                  {new Date(a.created_at).toLocaleDateString(undefined, {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
              <p className="flex items-center gap-1 text-[12px] mb-3" style={{ color: "#3d7a62", ...NK_TEXT }}>
                <User size={11} /> {a.author_username}
              </p>
              <p className="text-[14px] leading-[1.6]" style={{ color: "#2d5a45", ...NK_TEXT }}>
                {a.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
