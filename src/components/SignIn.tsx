"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

// WCAG: #1b4332 on #ffffff 11.3:1 ✓ | #3d7a62 on #ffffff 5.4:1 ✓

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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#3d7a62",
  marginBottom: "6px",
  ...NK_MED,
};

export default function SignIn() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { alert(error.message); return; }
    router.push(redirectTo);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="text-[32px] font-medium leading-[1.2] mb-10 text-center"
          style={{ color: "#1b4332", ...NK_DISPLAY }}
        >
          Sign In
        </h1>

        <div className="space-y-5">
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center justify-center w-10 h-10 shrink-0 transition-opacity hover:opacity-60"
                style={{ backgroundColor: "#f0f7f4", color: "#1b4332", borderRadius: "9999px", border: "none" }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full h-12 text-[16px] font-medium transition-opacity hover:opacity-75 disabled:opacity-40 mt-2"
            style={{ backgroundColor: "#1b4332", color: "#ffffff", borderRadius: "9999px", border: "none", ...NK_MED }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>

        <p className="mt-6 text-center text-[13px]" style={{ color: "#3d7a62", ...NK_TEXT }}>
          Don&apos;t have an account?{" "}
          <a
            href={`/signup${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            style={{ color: "#1b4332", fontWeight: 500, textDecoration: "underline" }}
          >
            Sign Up
          </a>
        </p>
      </div>
    </main>
  );
}