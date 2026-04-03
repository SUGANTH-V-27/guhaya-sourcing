"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      console.log("login", { email });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-display text-center">Guhaya Sourcing</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        {error ? (
          <p className="text-error rounded-lg border border-[var(--error)] bg-[var(--bg-primary)] px-3 py-2" role="alert">
            {error}
          </p>
        ) : null}

        <div>
          <label htmlFor="login-email" className="text-label block">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input mt-1.5"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="text-label block">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input mt-1.5"
            placeholder="Password"
          />
        </div>

        <p className="text-muted text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Sign up
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="text-button w-full rounded-lg bg-[var(--accent)] py-2.5 text-white ring-0 outline-none hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
