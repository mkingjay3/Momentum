"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Gallery", href: "/gallery" },
  { name: "Calendar", href: "/calendar" },
  { name: "Announcements", href: "/announcements" },
  { name: "Map", href: "/map" },
  { name: "Activity Log", href: "/activitylog" },
  { name: "Trails", href: "/trails" },
  { name: "Calculator", href: "/calculator" },
];

const NK = {
  fontFamily: "Helvetica Now Text Medium, Helvetica, Arial, sans-serif",
};

// WCAG contrast notes:
// Nav bg: #1b4332 (dark forest green)
// White on #1b4332: 11.3:1 ✓ AAA
// #74b89e (inactive links) on #1b4332: 4.6:1 ✓ AA
// #1b4332 on #f0f7f4 (Sign In button): 10.4:1 ✓ AAA

export default function Navbar() {
  const supabase = createClient();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* Primary nav — dark forest green, 56px, flat */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
        style={{ backgroundColor: "#1b4332", height: "56px" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-[16px] font-[500] tracking-tight"
          style={{ color: "#ffffff", ...NK }}
        >
          Momentum
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-1 text-[14px] font-[500] transition-opacity"
                style={{
                  color: active ? "#ffffff" : "#74b89e",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "4px",
                  ...NK,
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop auth */}
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-5 h-9 text-[14px] font-[500] transition-opacity hover:opacity-75"
              style={{
                backgroundColor: "#f0f7f4",
                color: "#1b4332",
                borderRadius: "9999px",
                border: "none",
                ...NK,
              }}
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/signin"
              className="px-5 h-9 flex items-center text-[14px] font-[500] transition-opacity hover:opacity-75"
              style={{
                backgroundColor: "#f0f7f4",
                color: "#1b4332",
                borderRadius: "9999px",
                ...NK,
              }}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10"
          style={{ color: "#ffffff" }}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className="fixed top-0 left-0 bottom-0 z-[70] flex flex-col"
        style={{
          backgroundColor: "#1b4332",
          width: "280px",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
      >
        <div
          className="flex items-center justify-between px-6 h-14 shrink-0"
          style={{ borderBottom: "1px solid #2d5a45" }}
        >
          <span className="text-[16px] font-[500]" style={{ color: "#ffffff", ...NK }}>
            Momentum
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ color: "#74b89e" }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col py-4 flex-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className="px-6 py-4 text-[16px] font-[500]"
                style={{
                  color: active ? "#ffffff" : "#74b89e",
                  borderBottom: "1px solid #2d5a45",
                  ...NK,
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-6 shrink-0">
          {user ? (
            <button
              onClick={() => { supabase.auth.signOut(); setDrawerOpen(false); }}
              className="w-full h-12 text-[16px] font-[500]"
              style={{ backgroundColor: "#f0f7f4", color: "#1b4332", borderRadius: "9999px", ...NK }}
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/signin"
              onClick={() => setDrawerOpen(false)}
              className="w-full h-12 flex items-center justify-center text-[16px] font-[500]"
              style={{ backgroundColor: "#f0f7f4", color: "#1b4332", borderRadius: "9999px", ...NK }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}