"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/../services/auth.service";

const SESSION_KEY = "guhaya_intro_seen_v2";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Video intro state
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // If prefers reduced motion, skip video
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setIsPlayingVideo(false);
      setVideoEnded(true);
      return;
    }

    // Auto-advance safety timer in case video fails or finishes
    const timer = setTimeout(() => {
      handleVideoFinished();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  function handleVideoFinished() {
    setIsPlayingVideo(false);
    // Keep videoEnded false for 4.2 seconds - gives flying logo time (3.2s) + breath time (1s)
    setTimeout(() => {
      setVideoEnded(true);
    }, 4200);
    sessionStorage.setItem(SESSION_KEY, "1");
  }



  /* Auth handler */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login(email.trim(), password);
      if (res?.user && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("token", res.token);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full min-h-[580px] flex flex-col items-center justify-center">
      {/* ── Brand Video Intro Overlay (Full Screen Cinematic) ────────────────────────────────────── */}
      <AnimatePresence>
        {isPlayingVideo && (
          <motion.div
            key="intro-video-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <video
              ref={videoRef}
              src="/intro-video.mp4"
              autoPlay
              muted
              playsInline
              onEnded={handleVideoFinished}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Flying Logo (Video Logo transitioning to Login Logo) ────────────────────────────────────── */}
      <AnimatePresence>
        {!isPlayingVideo && !videoEnded && (
          <motion.div
            key="flying-logo"
            initial={{ 
              opacity: 1, 
              scale: 2.6, 
              top: "45%", 
              left: "50%",
              translateX: "-50%",
              translateY: "-50%"
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              top: "32%", 
              left: "50%",
              translateX: "-50%",
              translateY: "-50%"
            }}
            exit={{ opacity: 1 }}
            transition={{ duration: 2.0, ease: "easeOut" }}
            className="fixed z-50 flex items-center justify-center pointer-events-none"
          >
            <img
              src="/guhayalogo.png"
              alt="Guhaya Sourcing Logo"
              className="h-44 sm:h-48 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,191,165,0.6)]"
              style={{ filter: "brightness(1.1) saturate(1.2)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Black background fade during logo flight ────────────────────────────────────── */}
      <AnimatePresence>
        {!isPlayingVideo && !videoEnded && (
          <motion.div
            key="bg-fade"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ── Main Login Layout ────────────────────────────────────────────── */}
      {videoEnded && (
        <div className="w-full flex flex-col items-center">
          {/* Brand Logo - Stays visible instantly where flying logo landed */}
          <div className="mb-6 flex flex-col items-center text-center select-none group relative">
            <img
              src="/guhayalogo.png"
              alt="Guhaya Sourcing Logo"
              className="h-44 sm:h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(0,191,165,0.6)]"
              style={{ filter: "brightness(1.1) saturate(1.2)" }}
            />
          </div>

          {/* Login Form - Fades in after logo is visible */}
          <motion.form
            onSubmit={handleSubmit}
            key="login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full space-y-4 max-w-md"
          >
          {error && (
            <div
              className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-xs text-red-400 text-center"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-gray-300 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative flex items-center rounded-xl border border-gray-800 bg-[#0d1519]/90 px-3.5 py-2.5 transition focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30">
              <Mail size={16} className="text-gray-400 shrink-0 mr-3" />
              <input
                id="login-email"
                type="email"
                required
                placeholder="merchandiser@guhaya.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-gray-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center rounded-xl border border-gray-800 bg-[#0d1519]/90 px-3.5 py-2.5 transition focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30">
              <Lock size={16} className="text-gray-400 shrink-0 mr-3" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none pr-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-200 transition shrink-0"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 rounded-xl bg-[#00BFA5] py-3 text-sm font-semibold text-white shadow-lg shadow-teal-950/40 hover:bg-[#00ab94] active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Authenticating…</span>
              </>
            ) : (
              "Sign In to Guhaya Track"
            )}
          </button>

          <div className="text-center pt-2 text-xs text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-teal-400 hover:underline font-medium">
              Create one
            </Link>
          </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
