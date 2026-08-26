"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Lock, Mail, Play, SkipForward } from "lucide-react";
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
    // If already seen in this session or prefers reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || sessionStorage.getItem(SESSION_KEY)) {
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
    setVideoEnded(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  }

  function handleReplayVideo() {
    sessionStorage.removeItem(SESSION_KEY);
    setVideoEnded(false);
    setIsPlayingVideo(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
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
      {/* ── Brand Video Intro Overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {isPlayingVideo && (
          <motion.div
            key="intro-video-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            <div className="relative max-w-lg w-full px-6 flex flex-col items-center">
              <video
                ref={videoRef}
                src="/intro-video.mp4"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoFinished}
                className="w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
              />

              <button
                type="button"
                onClick={handleVideoFinished}
                className="mt-6 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-semibold hover:bg-teal-500/20 hover:border-teal-400 transition"
              >
                <span>Skip Intro</span>
                <SkipForward size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Login Layout ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: videoEnded ? 0 : 0.2 }}
        className="w-full flex flex-col items-center"
      >
        {/* Brand Logo & Replay Button */}
        <div className="mb-6 flex flex-col items-center text-center select-none group relative">
          <img
            src="/guhayalogo.png"
            alt="Guhaya Sourcing Logo"
            className="h-44 sm:h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={handleReplayVideo}
            title="Replay intro video"
            className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-teal-400 transition"
          >
            <Play size={11} /> Replay Intro
          </button>
        </div>

        {/* Login Form Card */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 max-w-md">
          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300 animate-in fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="merchandiser@guhaya.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-[#0d1414] px-4 py-2.5 pl-10 text-xs text-white placeholder-gray-600 focus:border-teal-400 focus:outline-none transition shadow-inner"
              />
              <Mail size={15} className="absolute left-3.5 top-3 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-[#0d1414] px-4 py-2.5 pl-10 pr-10 text-xs text-white placeholder-gray-600 focus:border-teal-400 focus:outline-none transition shadow-inner"
              />
              <Lock size={15} className="absolute left-3.5 top-3 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#00BFA5] py-2.5 text-xs font-bold text-black shadow-lg hover:bg-[#00a892] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating..." : "Sign In to Guhaya Track"}
          </button>

          <div className="text-center pt-2 text-xs text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-teal-400 hover:underline font-medium">
              Create one
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
