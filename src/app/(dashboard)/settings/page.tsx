"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, Lock, Download, Database, Check, AlertCircle, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function SettingsPage() {
  const [householdName, setHouseholdName] = useState("Kurian Household - Karoor");
  const [dueReminderDays, setDueReminderDays] = useState(5);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Seeder
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setHouseholdName(data.settings.householdName || "Kurian Household - Karoor");
          setDueReminderDays(data.settings.dueReminderDays || 5);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdName, dueReminderDays: Number(dueReminderDays) }),
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Seed or restore sample KSEB bills and payments (including the Pala Section sample bill)?")) {
      return;
    }
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Application Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure household preferences, change owner master credentials, and export data
          </p>
        </div>

        {/* Household Preferences */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Household & Locale Configuration</CardTitle>
            <CardDescription>
              Timezone is fixed to Asia/Kolkata and currency to Indian Rupee (₹)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="householdName">Household Name</Label>
                  <Input
                    id="householdName"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dueReminderDays">Upcoming Due Alert Threshold</Label>
                  <Input
                    id="dueReminderDays"
                    type="number"
                    min="1"
                    max="30"
                    value={dueReminderDays}
                    onChange={(e) => setDueReminderDays(Number(e.target.value))}
                    required
                    className="mt-1 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Triggers warning banner when bill due date is within this number of days
                  </p>
                </div>

                <div>
                  <Label>Currency</Label>
                  <Input value="INR (₹ - Indian Rupee)" disabled className="mt-1 bg-slate-100 dark:bg-slate-800" />
                </div>

                <div>
                  <Label>Timezone</Label>
                  <Input value="Asia/Kolkata (UTC +05:30)" disabled className="mt-1 bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {settingsSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="h-4 w-4" /> Settings updated successfully
                  </span>
                )}
                <Button type="submit" disabled={savingSettings} size="sm" className="ml-auto">
                  {savingSettings ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Master Password */}
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-600" />
              Owner Security & Password
            </CardTitle>
            <CardDescription>
              Update your master administrator password for single-owner authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Master password updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password (min 8 characters)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <Button type="submit" disabled={changingPassword} size="sm">
                {changingPassword ? "Updating..." : "Update Master Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Data Exports & Seed Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-600" />
                Export Ledger
              </CardTitle>
              <CardDescription>
                Download full data dumps formatted for spreadsheets (Excel / Google Sheets)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/api/export/bills"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                <span>Export All KSEB Bills (CSV)</span>
                <Download className="h-4 w-4 text-emerald-600" />
              </a>

              <a
                href="/api/export/payments"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                <span>Export All Payments (CSV)</span>
                <Download className="h-4 w-4 text-emerald-600" />
              </a>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                Sample Data Management
              </CardTitle>
              <CardDescription>
                Restore sample KSEB bills (Kuriyakose Alexander, Pala Section)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">
                Populates the sample spot notice bill from the photo + 6 bi-monthly cycles for instant analytics.
              </p>
              <div className="flex items-center justify-between">
                {seedSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Seeded!
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="gap-1.5 text-xs ml-auto"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${seeding ? "animate-spin" : ""}`} />
                  {seeding ? "Seeding..." : "Reset / Seed Sample Data"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
