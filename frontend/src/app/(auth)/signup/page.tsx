"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      console.log("signup", { name, email });
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
          <label htmlFor="signup-name" className="text-label block">
            Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input mt-1.5"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="text-label block">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input mt-1.5"
            placeholder="you@email.com"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="text-label block">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input mt-1.5"
            placeholder="Password"
          />
        </div>

        <div>
          <label htmlFor="signup-confirm" className="text-label block">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="field-input mt-1.5"
            placeholder="Confirm password"
          />
        </div>

        <p className="text-muted text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Log in
          </Link>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="text-button w-full rounded-lg bg-[var(--accent)] py-2.5 text-white ring-0 outline-none hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
