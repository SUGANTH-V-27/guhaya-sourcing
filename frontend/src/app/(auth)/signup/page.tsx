"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { authService } from "@/../services/auth.service";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register(email.trim(), name.trim(), password);
      if (res?.user && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("token", res.token);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Brand Logo: Clean & static */}
      <div className="mb-6 flex flex-col items-center text-center select-none">
        <img
          src="/guhayalogo.png"
          alt="Guhaya Sourcing Logo"
          className="h-48 w-auto object-contain animate-in fade-in duration-700 drop-shadow-[0_0_20px_rgba(0,191,165,0.6)]"
          style={{ filter: "brightness(1.1) saturate(1.2)" }}
        />
      </div>

      {/* Signup Form Card */}
      <form onSubmit={handleSubmit} className="w-full space-y-3.5">
        {error && (
          <div
            className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-xs text-red-400 text-center"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Name Field */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-medium text-gray-300 mb-1.5"
          >
            Full Name
          </label>
          <div className="relative flex items-center rounded-xl border border-gray-800 bg-[#0d1519]/90 px-3.5 py-2.5 transition focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30">
            <User size={16} className="text-gray-400 shrink-0 mr-3" />
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-medium text-gray-300 mb-1.5"
          >
            Email
          </label>
          <div className="relative flex items-center rounded-xl border border-gray-800 bg-[#0d1519]/90 px-3.5 py-2.5 transition focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30">
            <Mail size={16} className="text-gray-400 shrink-0 mr-3" />
            <input
              id="signup-email"
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
            htmlFor="signup-password"
            className="block text-xs font-medium text-gray-300 mb-1.5"
          >
            Password
          </label>
          <div className="relative flex items-center rounded-xl border border-gray-800 bg-[#0d1519]/90 px-3.5 py-2.5 transition focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30">
            <Lock size={16} className="text-gray-400 shrink-0 mr-3" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
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

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="signup-confirm"
            className="block text-xs font-medium text-gray-300 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative flex items-center rounded-xl border border-gray-800 bg-[#0d1519]/90 px-3.5 py-2.5 transition focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/30">
            <Lock size={16} className="text-gray-400 shrink-0 mr-3" />
            <input
              id="signup-confirm"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none pr-2"
            />
          </div>
        </div>

        {/* Already have an account link */}
        <div className="text-right pt-1">
          <span className="text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#00BFA5] hover:underline transition"
            >
              Sign in
            </Link>
          </span>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 rounded-xl bg-[#00BFA5] py-3 text-sm font-semibold text-white shadow-lg shadow-teal-950/40 hover:bg-[#00ab94] active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Creating account…</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}
