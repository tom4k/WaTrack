"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, ShieldCheck, Lock, Mail, User, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const explicitSetup = searchParams.get("mode") === "setup";

  const [isSetupMode, setIsSetupMode] = useState(explicitSetup);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          setIsSetupMode(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.authenticated) {
          router.push(from);
        } else if (!data.hasOwner || explicitSetup) {
          setIsSetupMode(true);
        }
      })
      .catch(() => {
        setIsSetupMode(true);
      })
      .finally(() => setCheckingAuth(false));
  }, [from, router, explicitSetup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSetupMode) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const res = await fetch("/api/auth/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, confirmPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Setup failed");
        router.push(from);
        router.refresh();
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid credentials");
        router.push(from);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-emerald-400 animate-bounce" />
          <span className="font-semibold text-sm">Loading WaTrack...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/25 mb-4 ring-1 ring-white/20">
            <Zap className="h-7 w-7 fill-white text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
            WaTrack
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mt-1">
            Personal KSEB Electricity Bill Manager
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            {isSetupMode
              ? "Initial Household Setup: Create your master administrator account."
              : "Owner-Only Authentication: Secure access to your household electricity dashboard."}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="font-bold text-sm text-slate-200">
                {isSetupMode ? "Setup Master Account" : "Household Owner Sign In"}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Private
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetupMode && (
              <div>
                <Label htmlFor="name" className="text-slate-300">Administrator Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kurian / Administrator"
                    required
                    className="pl-9 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-300">Owner Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourdomain.com"
                  required
                  className="pl-9 bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9 bg-slate-950 border-slate-800 text-white"
                />
              </div>
            </div>

            {isSetupMode && (
              <div>
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm gap-2 shadow-lg shadow-emerald-600/25"
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  <span>{isSetupMode ? "Complete Setup & Launch" : "Access Dashboard"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Setup Toggle & Helpers */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsSetupMode(!isSetupMode);
              }}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 transition-colors"
            >
              {isSetupMode
                ? "Already configured? Sign in as Owner →"
                : "First time here? Switch to Initial Household Setup →"}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          KSEB Spot Demand & Disconnection Tracking System • Asia/Kolkata
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-emerald-400 animate-bounce" />
            <span className="font-semibold text-sm">Loading WaTrack...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
