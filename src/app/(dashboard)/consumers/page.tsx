"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Edit, Check, Shield, MapPin, Zap, Phone, Hash } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { formatINR } from "@/lib/formatters";

export default function ConsumersPage() {
  const [consumers, setConsumers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConsumer, setEditingConsumer] = useState<any | null>(null);

  // Form State
  const [consumerNumber, setConsumerNumber] = useState("");
  const [consumerId, setConsumerId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [sectionName, setSectionName] = useState("Pala Section-5624");
  const [sectionPhone, setSectionPhone] = useState("0482-2212477");
  const [tariff, setTariff] = useState("LT-1 Dom");
  const [connectedLoad, setConnectedLoad] = useState("10 kW");
  const [phase, setPhase] = useState("3 Phase");
  const [transformer, setTransformer] = useState("POOTHAKUZHY");
  const [postNumber, setPostNumber] = useState("PR-124/4/4");
  const [meterSerialNumber, setMeterSerialNumber] = useState("HEP7198657");
  const [securityDeposit, setSecurityDeposit] = useState("9849.00");
  const [isDefault, setIsDefault] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsumers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/consumers");
      if (res.ok) {
        const data = await res.json();
        setConsumers(data.consumers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumers();
  }, []);

  const openCreateModal = () => {
    setEditingConsumer(null);
    setConsumerNumber("");
    setConsumerId("");
    setName("");
    setAddress("");
    setPhone("");
    setSectionName("Pala Section-5624");
    setSectionPhone("0482-2212477");
    setTariff("LT-1 Dom");
    setConnectedLoad("10 kW");
    setPhase("3 Phase");
    setTransformer("POOTHAKUZHY");
    setPostNumber("PR-124/4/4");
    setMeterSerialNumber("HEP7198657");
    setSecurityDeposit("9849.00");
    setIsDefault(consumers.length === 0);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingConsumer(c);
    setConsumerNumber(c.consumerNumber || "");
    setConsumerId(c.consumerId || "");
    setName(c.name || "");
    setAddress(c.address || "");
    setPhone(c.phone || "");
    setSectionName(c.sectionName || "Pala Section-5624");
    setSectionPhone(c.sectionPhone || "0482-2212477");
    setTariff(c.tariff || "LT-1 Dom");
    setConnectedLoad(c.connectedLoad || "10 kW");
    setPhase(c.phase || "3 Phase");
    setTransformer(c.transformer || "");
    setPostNumber(c.postNumber || "");
    setMeterSerialNumber(c.meterSerialNumber || "");
    setSecurityDeposit(String(c.securityDeposit || "0.00"));
    setIsDefault(Boolean(c.isDefault));
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!consumerNumber || !name || !sectionName) {
        throw new Error("Consumer number, name, and section name are required");
      }

      const payload = {
        consumerNumber,
        consumerId: consumerId || null,
        name,
        address: address || null,
        phone: phone || null,
        sectionName,
        sectionPhone: sectionPhone || null,
        tariff,
        connectedLoad,
        phase,
        transformer: transformer || null,
        postNumber: postNumber || null,
        meterSerialNumber: meterSerialNumber || null,
        securityDeposit: parseFloat(securityDeposit || "0"),
        isDefault,
      };

      const url = editingConsumer ? `/api/consumers/${editingConsumer.id}` : "/api/consumers";
      const method = editingConsumer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save consumer");

      setIsModalOpen(false);
      fetchConsumers();
    } catch (err: any) {
      setError(err.message || "Failed to save consumer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              KSEB Consumer Profiles
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registered electricity connection details, electrical section, connected load, and meter specifications
            </p>
          </div>

          <Button onClick={openCreateModal} className="gap-2 text-xs font-semibold self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Add Connection Profile
          </Button>
        </div>

        {/* Consumer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {consumers.map((c) => (
            <Card
              key={c.id}
              className={`border transition-all ${
                c.isDefault
                  ? "border-emerald-500/80 dark:border-emerald-500/60 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                  : "border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">{c.name}</CardTitle>
                      {c.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Primary Household
                        </span>
                      )}
                    </div>
                    <CardDescription className="font-mono text-xs mt-0.5">
                      13-digit Consumer #: <span className="font-bold text-slate-800 dark:text-slate-200">{c.consumerNumber}</span>
                    </CardDescription>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(c)}
                  className="h-8 text-xs gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Electrical Section</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{c.sectionName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{c.sectionPhone || "0482-2212477"}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Tariff & Load</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{c.tariff}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{c.connectedLoad} ({c.phase})</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Meter Serial No</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{c.meterSerialNumber || "HEP7198657"}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{c.meterStatus || "Working"}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Security Deposit</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
                      {formatINR(c.securityDeposit)}
                    </span>
                    <span className="text-[10px] text-slate-500">Cash Deposit with KSEB</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/50 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transformer:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{c.transformer || "POOTHAKUZHY"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Post Number:</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{c.postNumber || "PR-124/4/4"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered Address:</span>
                    <span className="text-right text-slate-700 dark:text-slate-300 truncate max-w-[240px]">{c.address || "KAYATHINKARA, KAROOR, PO, KOTTAYAM"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal Dialog */}
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} size="lg">
            <DialogHeader>
              <DialogTitle>
                {editingConsumer ? "Edit KSEB Consumer Connection" : "Add KSEB Consumer Profile"}
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Connection details as registered with Kerala State Electricity Board
              </p>
            </DialogHeader>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consumerNumber">13-Digit Consumer Number (C#) *</Label>
                  <Input
                    id="consumerNumber"
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                    placeholder="1156241018150"
                    required
                    className="mt-1 font-mono font-bold"
                  />
                </div>

                <div>
                  <Label htmlFor="consumerId">Consumer ID (കൺസ്യൂമർ ഐഡി)</Label>
                  <Input
                    id="consumerId"
                    value={consumerId}
                    onChange={(e) => setConsumerId(e.target.value)}
                    placeholder="10975757"
                    className="mt-1 font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Consumer Name (പേര്) *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="KURIAKOSE ALEXANDER"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (ഫോൺ)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9446003108"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sectionName">Section Name & Code *</Label>
                  <Input
                    id="sectionName"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="Pala Section-5624"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sectionPhone">Section Contact Phone</Label>
                  <Input
                    id="sectionPhone"
                    value={sectionPhone}
                    onChange={(e) => setSectionPhone(e.target.value)}
                    placeholder="0482-2212477"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tariff">Tariff (താരീഫ്)</Label>
                  <Select
                    id="tariff"
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    className="mt-1"
                  >
                    <option value="LT-1 Dom">LT-1 Dom (Domestic)</option>
                    <option value="LT-4 Agri">LT-4 Agri (Agricultural)</option>
                    <option value="LT-7 Com">LT-7 Com (Commercial)</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="connectedLoad">Connected Load</Label>
                  <Input
                    id="connectedLoad"
                    value={connectedLoad}
                    onChange={(e) => setConnectedLoad(e.target.value)}
                    placeholder="10 kW"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phase">Phase (ഫേസ്)</Label>
                  <Select
                    id="phase"
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="mt-1"
                  >
                    <option value="3 Phase">3 Phase</option>
                    <option value="1 Phase">1 Phase</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="meterSerialNumber">Meter Serial Number</Label>
                  <Input
                    id="meterSerialNumber"
                    value={meterSerialNumber}
                    onChange={(e) => setMeterSerialNumber(e.target.value)}
                    placeholder="HEP7198657"
                    className="mt-1 font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="transformer">Transformer (ട്രാൻസ്ഫോർമർ)</Label>
                  <Input
                    id="transformer"
                    value={transformer}
                    onChange={(e) => setTransformer(e.target.value)}
                    placeholder="POOTHAKUZHY"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="postNumber">Post Number (പോസ്റ്റ് നം)</Label>
                  <Input
                    id="postNumber"
                    value={postNumber}
                    onChange={(e) => setPostNumber(e.target.value)}
                    placeholder="PR-124/4/4"
                    className="mt-1 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="address">Registered Address (വിലാസം)</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="KAYATHINKARA, KAROOR, PO, KOTTAYAM"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="securityDeposit">Security Deposit (Rs.)</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    step="0.01"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="9849.00"
                    className="mt-1 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer normal-case">
                    Set as default connection for dashboard
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingConsumer ? "Update Profile" : "Save Profile"}
                </Button>
              </DialogFooter>
            </form>
          </Dialog>
        )}
      </div>
    </AppShell>
  );
}
