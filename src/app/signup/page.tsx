"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

// WCAG: #1b4332 on #ffffff 11.3:1 ✓ | #3d7a62 on #ffffff 5.4:1 ✓

const NK_DISPLAY = {
  fontFamily: "Helvetica Now Display Medium, Helvetica, Arial, sans-serif",
};
const NK_TEXT = {
  fontFamily: "Helvetica Now Text, Helvetica, Arial, sans-serif",
};
const NK_MED = {
  fontFamily: "Helvetica Now Text Medium, Helvetica, Arial, sans-serif",
};

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

export default function SignUp() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
          birthday: date,
        },
      },
    });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    alert("Check your email to confirm your account");
    router.push(redirectTo);
  };

  const fields: { label: string; content: React.ReactNode }[] = [
    {
      label: "First Name",
      content: (
        <input
          type="text"
          placeholder="John"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={inputStyle}
        />
      ),
    },
    {
      label: "Last Name",
      content: (
        <input
          type="text"
          placeholder="Smith"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={inputStyle}
        />
      ),
    },
    {
      label: "Username",
      content: (
        <input
          type="text"
          placeholder="smithjohn123"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
      ),
    },
    {
      label: "Date of Birth",
      content: (
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
        />
      ),
    },
    {
      label: "Email",
      content: (
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      ),
    },
    {
      label: "Password",
      content: (
        <div className="flex gap-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center justify-center w-10 h-10 shrink-0 transition-opacity hover:opacity-60"
            style={{
              backgroundColor: "#f0f7f4",
              color: "#1b4332",
              borderRadius: "9999px",
              border: "none",
            }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <main
      className="min-h-screen flex items-start justify-center px-6 py-16"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="text-[32px] font-medium leading-[1.2] mb-10 text-center"
          style={{ color: "#1b4332", ...NK_DISPLAY }}
        >
          Sign Up
        </h1>

        <div className="space-y-5">
          {fields.map(({ label, content }) => (
            <div key={label}>
              <label style={labelStyle}>{label}</label>
              {content}
            </div>
          ))}

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full h-12 text-[16px] font-medium transition-opacity hover:opacity-75 disabled:opacity-40 mt-2"
            style={{
              backgroundColor: "#1b4332",
              color: "#ffffff",
              borderRadius: "9999px",
              border: "none",
              ...NK_MED,
            }}
          >
            {loading ? "Creating…" : "Sign Up"}
          </button>
        </div>

        <p
          className="mt-6 text-center text-[13px]"
          style={{ color: "#3d7a62", ...NK_TEXT }}
        >
          Already have an account?{" "}
          <a
            href={`/signin${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            style={{
              color: "#1b4332",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            Sign In
          </a>
        </p>
      </div>
    </main>
  );
}
