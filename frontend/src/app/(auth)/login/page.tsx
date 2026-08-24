"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "guhaya_intro_seen";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* Intro animation stages */
  const [stage, setStage] = useState<
    "spark" | "nib" | "leaves" | "peacock" | "emblem_done" | "wordmark" | "settle" | "docked"
  >("spark");
  const [isIntroActive, setIsIntroActive] = useState(true);

  useEffect(() => {
    // Check reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || sessionStorage.getItem(SESSION_KEY)) {
      setIsIntroActive(false);
      setStage("docked");
      return;
    }

    // Sequence timeline
    const t1 = setTimeout(() => setStage("nib"), 300);          // 0.30s: nib/teardrop draw
    const t2 = setTimeout(() => setStage("leaves"), 800);       // 0.80s: leaves sweep in
    const t3 = setTimeout(() => setStage("peacock"), 1300);     // 1.30s: peacock forms
    const t4 = setTimeout(() => setStage("emblem_done"), 1800); // 1.80s: emblem complete
    const t5 = setTimeout(() => setStage("wordmark"), 2300);    // 2.30s: wordmark reveals
    const t6 = setTimeout(() => setStage("settle"), 2800);      // 2.80s: glow settles
    const t7 = setTimeout(() => {
      // 3.20s - 4.00s: Move directly into final login page layout
      setIsIntroActive(false);
      setStage("docked");
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 3200);

    return () => {
      [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout);
    };
  }, []);

  /* Auth handler */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* Clip-path reveal progression on the exact logo */
  const getClipPath = useCallback(() => {
    switch (stage) {
      case "spark":
        return "inset(12% 47% 75% 47%)";
      case "nib":
        return "inset(5% 35% 52% 35%)";
      case "leaves":
        return "inset(5% 8% 52% 8%)";
      case "peacock":
        return "inset(5% 5% 32% 5%)";
      case "emblem_done":
        return "inset(0% 2% 26% 2%)";
      case "wordmark":
      case "settle":
      case "docked":
      default:
        return "inset(0% 0% 0% 0%)";
    }
  }, [stage]);

  const stageIndex = [
    "spark",
    "nib",
    "leaves",
    "peacock",
    "emblem_done",
    "wordmark",
    "settle",
    "docked",
  ].indexOf(stage);

  return (
    <div className="relative w-full min-h-[580px] flex flex-col items-center justify-center">
      {/* ── Background Spark & Glow Aura during Intro ────────────────── */}
      <AnimatePresence>
        {isIntroActive && (
          <>
            {/* Spark point at center (0.00s - 0.30s) */}
            {stage === "spark" && (
              <motion.div
                key="spark-point"
                className="absolute z-30 rounded-full bg-teal-300"
                style={{
                  width: 8,
                  height: 8,
                  top: "40%",
                  left: "50%",
                  marginLeft: -4,
                  marginTop: -4,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 2, 1],
                  opacity: [0, 1, 0.8],
                  boxShadow: [
                    "0 0 0px rgba(0,191,165,0)",
                    "0 0 35px rgba(0,191,165,1)",
                    "0 0 15px rgba(0,191,165,0.6)",
                  ],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            )}

            {/* Subtle radial teal ambient light during reveal */}
            <motion.div
              key="ambient-glow"
              className="absolute z-10 pointer-events-none rounded-full"
              style={{
                width: 320,
                height: 320,
                top: "40%",
                left: "50%",
                marginLeft: -160,
                marginTop: -160,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: stageIndex >= 1 && stageIndex <= 5 ? 0.18 : 0,
                scale: stageIndex >= 4 ? 1.4 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="w-full h-full rounded-full bg-teal-400 blur-[90px]" />
            </motion.div>

            {/* Settling particles at (2.80s - 3.20s) */}
            {stage === "settle" && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                {[
                  { x: -50, y: -30, d: 0.05 },
                  { x: 60, y: -40, d: 0.1 },
                  { x: -70, y: 40, d: 0.15 },
                  { x: 80, y: 30, d: 0.2 },
                  { x: -30, y: 70, d: 0.25 },
                  { x: 40, y: -70, d: 0.3 },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-teal-400/80"
                    style={{ top: "40%", left: "50%" }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      opacity: [1, 0.8, 0],
                      scale: [1, 1.2, 0.2],
                    }}
                    transition={{ duration: 0.7, delay: p.d, ease: "easeOut" }}
                  />
                ))}
              </div>
            )}

            {/* Skip Intro Button */}
            <motion.button
              key="skip-btn"
              onClick={() => {
                setIsIntroActive(false);
                setStage("docked");
                sessionStorage.setItem(SESSION_KEY, "1");
              }}
              className="absolute top-2 right-2 z-40 text-[11px] font-medium text-gray-500 hover:text-teal-400 transition bg-black/40 px-2.5 py-1 rounded-md border border-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.8 }}
            >
              Skip Intro
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* ── Single Persistent Logo with Layout Motion Transition ──────── */}
      <motion.div
        layout
        transition={{
          layout: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
        }}
        className={`relative z-20 flex flex-col items-center text-center select-none ${isIntroActive ? "my-auto py-12" : "mb-6"
          }`}
      >
        <motion.img
          layout="position"
          src="/guhayalogo.png"
          alt="Guhaya Sourcing"
          style={{
            clipPath: getClipPath(),
          }}
          className={`w-auto object-contain transition-all duration-500 ${isIntroActive
            ? "h-[290px] sm:h-[320px] drop-shadow-[0_0_20px_rgba(0,191,165,0.4)]"
            : "h-56 drop-shadow-none"
            }`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: stageIndex >= 1 ? 1 : 0,
          }}
          transition={{
            clipPath: { duration: 0.45, ease: [0.33, 1, 0.68, 1] },
            opacity: { duration: 0.3 },
          }}
        />
      </motion.div>

      {/* ── Login Form Card: Smoothly fades/slides up after intro ──────── */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={
          stage === "docked"
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 24, pointerEvents: "none" }
        }
        transition={{
          duration: 0.6,
          delay: 0.05,
          ease: "easeOut",
        }}
      >
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div
              className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-xs text-red-400 text-center"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-gray-300 mb-1.5"
            >
              Email
            </label>
            <div className="relative flex items-center rounded-xl border border-gray-800 bg-[#0d1519]/90 px-3.5 py-3 transition focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30">
              <Mail size={17} className="text-gray-400 shrink-0 mr-3" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-gray-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center rounded-xl border border-gray-800 bg-[#0d1519]/90 px-3.5 py-3 transition focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30">
              <Lock size={17} className="text-gray-400 shrink-0 mr-3" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none pr-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-200 transition shrink-0"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Don't have an account link */}
          <div className="text-right">
            <span className="text-xs text-gray-400">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-[#00BFA5] hover:underline transition"
              >
                Sign up
              </Link>
            </span>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 rounded-xl bg-[#00BFA5] py-3 text-sm font-semibold text-white shadow-lg shadow-teal-950/40 hover:bg-[#00ab94] active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing in…</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
