"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/utils";
import { signOut } from "next-auth/react";

const TABS = ["Company", "Industries", "Sources", "Areas", "Services", "WhatsApp Templates", "Account"] as const;

const SERVICE_CATEGORIES = [
  { value: "SOFTWARE_DEVELOPMENT", label: "Software Development" },
  { value: "CYBERSECURITY", label: "Cybersecurity" },
  { value: "AUTOMATION", label: "Automation" },
  { value: "AI_SERVICES", label: "AI Services" },
  { value: "OTHER", label: "Other" },
];

interface SettingsData {
  company: {
    companyName?: string;
    logoUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    gstNumber?: string | null;
    currency?: string;
  };
  industries: { id: string; name: string; isCustom: boolean; isActive: boolean; _count: { leads: number } }[];
  sources: { id: string; name: string; isCustom: boolean; isActive: boolean; _count: { leads: number } }[];
  areas: { id: string; name: string; isCustom: boolean; _count: { leads: number } }[];
  services: { id: string; name: string; category: string; defaultPrice: string | null; isActive: boolean }[];
  whatsappTemplates: { id: string; name: string; category: string; message: string; isActive: boolean }[];
}

export function SettingsPage() {
  const [data, setData] = React.useState<SettingsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string>("Company");
  const [companyForm, setCompanyForm] = React.useState({
    companyName: "", logoUrl: "", address: "", phone: "", email: "", website: "", gstNumber: "", currency: "INR",
  });
  const [savingCompany, setSavingCompany] = React.useState(false);

  // Dialog states
  const [industryDialogOpen, setIndustryDialogOpen] = React.useState(false);
  const [sourceDialogOpen, setSourceDialogOpen] = React.useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = React.useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = React.useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);

  const [editId, setEditId] = React.useState<string | null>(null);
  const [industryName, setIndustryName] = React.useState("");
  const [industryActive, setIndustryActive] = React.useState(true);
  const [sourceName, setSourceName] = React.useState("");
  const [sourceActive, setSourceActive] = React.useState(true);
  const [areaName, setAreaName] = React.useState("");
  const [serviceName, setServiceName] = React.useState("");
  const [serviceCategory, setServiceCategory] = React.useState("SOFTWARE_DEVELOPMENT");
  const [servicePrice, setServicePrice] = React.useState("");
  const [templateName, setTemplateName] = React.useState("");
  const [templateCategory, setTemplateCategory] = React.useState("");
  const [templateMessage, setTemplateMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setCompanyForm({
            companyName: json.company?.companyName ?? "WhiteRose",
            logoUrl: json.company?.logoUrl ?? "",
            address: json.company?.address ?? "",
            phone: json.company?.phone ?? "",
            email: json.company?.email ?? "",
            website: json.company?.website ?? "",
            gstNumber: json.company?.gstNumber ?? "",
            currency: json.company?.currency ?? "INR",
          });
        }
      } catch {
        if (!cancelled) toast.error("Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...companyForm,
          logoUrl: companyForm.logoUrl || null,
          address: companyForm.address || null,
          phone: companyForm.phone || null,
          email: companyForm.email || null,
          website: companyForm.website || null,
          gstNumber: companyForm.gstNumber || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Company settings saved");
    } catch {
      toast.error("Failed to save company settings");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleIndustrySave = async () => {
    if (!industryName) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const url = "/api/settings/industries";
      const method = editId ? "PUT" : "POST";
      const body = editId ? { id: editId, name: industryName, isActive: industryActive } : { name: industryName, isActive: industryActive };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error?.name?.[0] || "Failed"); }
      toast.success(editId ? "Industry updated" : "Industry added");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, industries: settingsData.industries } : prev);
      setIndustryDialogOpen(false);
      setEditId(null);
      setIndustryName("");
      setIndustryActive(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleIndustryDelete = async (id: string) => {
    if (!confirm("Delete this industry?")) return;
    try {
      const res = await fetch(`/api/settings/industries?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
      toast.success("Industry deleted");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, industries: settingsData.industries } : prev);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleSourceSave = async () => {
    if (!sourceName) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const url = "/api/settings/sources";
      const method = editId ? "PUT" : "POST";
      const body = editId ? { id: editId, name: sourceName, isActive: sourceActive } : { name: sourceName, isActive: sourceActive };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error?.name?.[0] || "Failed"); }
      toast.success(editId ? "Source updated" : "Source added");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, sources: settingsData.sources } : prev);
      setSourceDialogOpen(false);
      setEditId(null);
      setSourceName("");
      setSourceActive(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSourceDelete = async (id: string) => {
    if (!confirm("Delete this source?")) return;
    try {
      const res = await fetch(`/api/settings/sources?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
      toast.success("Source deleted");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, sources: settingsData.sources } : prev);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleAreaSave = async () => {
    if (!areaName) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const url = "/api/settings/areas";
      const method = editId ? "PUT" : "POST";
      const body = editId ? { id: editId, name: areaName } : { name: areaName };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error?.name?.[0] || "Failed"); }
      toast.success(editId ? "Area updated" : "Area added");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, areas: settingsData.areas } : prev);
      setAreaDialogOpen(false);
      setEditId(null);
      setAreaName("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAreaDelete = async (id: string) => {
    if (!confirm("Delete this area?")) return;
    try {
      const res = await fetch(`/api/settings/areas?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
      toast.success("Area deleted");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, areas: settingsData.areas } : prev);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleServiceSave = async () => {
    if (!serviceName) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const url = "/api/settings/services";
      const method = editId ? "PUT" : "POST";
      const body = editId
        ? { id: editId, name: serviceName, category: serviceCategory, defaultPrice: servicePrice ? parseFloat(servicePrice) : null }
        : { name: serviceName, category: serviceCategory, defaultPrice: servicePrice ? parseFloat(servicePrice) : null };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error?.name?.[0] || "Failed"); }
      toast.success(editId ? "Service updated" : "Service added");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, services: settingsData.services } : prev);
      setServiceDialogOpen(false);
      setEditId(null);
      setServiceName("");
      setServiceCategory("SOFTWARE_DEVELOPMENT");
      setServicePrice("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleServiceDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/settings/services?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
      toast.success("Service deactivated");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, services: settingsData.services } : prev);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleTemplateSave = async () => {
    if (!templateName || !templateCategory || !templateMessage) { toast.error("All fields required"); return; }
    setSaving(true);
    try {
      const url = "/api/settings/whatsapp-templates";
      const method = editId ? "PUT" : "POST";
      const body = editId
        ? { id: editId, name: templateName, category: templateCategory, message: templateMessage }
        : { name: templateName, category: templateCategory, message: templateMessage };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed");
      toast.success(editId ? "Template updated" : "Template added");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, whatsappTemplates: settingsData.whatsappTemplates } : prev);
      setTemplateDialogOpen(false);
      setEditId(null);
      setTemplateName("");
      setTemplateCategory("");
      setTemplateMessage("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      const res = await fetch(`/api/settings/whatsapp-templates?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Template deleted");
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setData((prev) => prev ? { ...prev, whatsappTemplates: settingsData.whatsappTemplates } : prev);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-rose-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your CRM configuration</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Company Tab */}
      {activeTab === "Company" && (
        <Card>
          <CardHeader><CardTitle>Company Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Company Name</Label>
                <Input value={companyForm.companyName} onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })} />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input value={companyForm.logoUrl} onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Input value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} />
              </div>
              <div>
                <Label>GST Number</Label>
                <Input value={companyForm.gstNumber} onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })} />
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={companyForm.currency} onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveCompany} disabled={savingCompany}>
                {savingCompany ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Industries Tab */}
      {activeTab === "Industries" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Industries</CardTitle>
            <Button size="sm" onClick={() => { setEditId(null); setIndustryName(""); setIndustryActive(true); setIndustryDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Custom</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.industries.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-6">No industries</TableCell></TableRow>
                ) : (
                  data.industries.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><Badge variant={item.isCustom ? "default" : "outline"}>{item.isCustom ? "Yes" : "No"}</Badge></TableCell>
                      <TableCell><Badge variant={item.isActive ? "success" : "default"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-center">{item._count.leads}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditId(item.id); setIndustryName(item.name); setIndustryActive(item.isActive); setIndustryDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleIndustryDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Sources Tab */}
      {activeTab === "Sources" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sources</CardTitle>
            <Button size="sm" onClick={() => { setEditId(null); setSourceName(""); setSourceActive(true); setSourceDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Custom</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sources.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-6">No sources</TableCell></TableRow>
                ) : (
                  data.sources.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><Badge variant={item.isCustom ? "default" : "outline"}>{item.isCustom ? "Yes" : "No"}</Badge></TableCell>
                      <TableCell><Badge variant={item.isActive ? "success" : "default"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-center">{item._count.leads}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditId(item.id); setSourceName(item.name); setSourceActive(item.isActive); setSourceDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSourceDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Areas Tab */}
      {activeTab === "Areas" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Areas</CardTitle>
            <Button size="sm" onClick={() => { setEditId(null); setAreaName(""); setAreaDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Custom</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.areas.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-6">No areas</TableCell></TableRow>
                ) : (
                  data.areas.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><Badge variant={item.isCustom ? "default" : "outline"}>{item.isCustom ? "Yes" : "No"}</Badge></TableCell>
                      <TableCell className="text-center">{item._count.leads}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditId(item.id); setAreaName(item.name); setAreaDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAreaDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Services Tab */}
      {activeTab === "Services" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Services</CardTitle>
            <Button size="sm" onClick={() => { setEditId(null); setServiceName(""); setServiceCategory("SOFTWARE_DEVELOPMENT"); setServicePrice(""); setServiceDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Default Price</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.services.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-6">No services</TableCell></TableRow>
                ) : (
                  data.services.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><Badge variant="default">{item.category.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-right">{item.defaultPrice ? formatINR(item.defaultPrice) : "-"}</TableCell>
                      <TableCell><Badge variant={item.isActive ? "success" : "default"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            setEditId(item.id); setServiceName(item.name); setServiceCategory(item.category); setServicePrice(item.defaultPrice ?? ""); setServiceDialogOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleServiceDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Templates Tab */}
      {activeTab === "WhatsApp Templates" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>WhatsApp Templates</CardTitle>
            <Button size="sm" onClick={() => { setEditId(null); setTemplateName(""); setTemplateCategory(""); setTemplateMessage(""); setTemplateDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Message</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.whatsappTemplates.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-6">No templates</TableCell></TableRow>
                ) : (
                  data.whatsappTemplates.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><Badge variant="default">{item.category}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-slate-500 max-w-xs truncate">{item.message}</TableCell>
                      <TableCell><Badge variant={item.isActive ? "success" : "default"}>{item.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            setEditId(item.id); setTemplateName(item.name); setTemplateCategory(item.category); setTemplateMessage(item.message); setTemplateDialogOpen(true);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTemplateDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Industry Dialog */}
      <Dialog open={industryDialogOpen} onOpenChange={setIndustryDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Industry" : "Add Industry"}</DialogTitle>
            <DialogDescription>{editId ? "Update industry details." : "Add a new industry."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={industryName} onChange={(e) => setIndustryName(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Label>Active</Label>
              <Select value={industryActive ? "true" : "false"} onValueChange={(v) => setIndustryActive(v === "true")}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIndustryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleIndustrySave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Source Dialog */}
      <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Source" : "Add Source"}</DialogTitle>
            <DialogDescription>{editId ? "Update source details." : "Add a new source."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Label>Active</Label>
              <Select value={sourceActive ? "true" : "false"} onValueChange={(v) => setSourceActive(v === "true")}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSourceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSourceSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Area Dialog */}
      <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Area" : "Add Area"}</DialogTitle>
            <DialogDescription>{editId ? "Update area details." : "Add a new area."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={areaName} onChange={(e) => setAreaName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAreaDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAreaSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>{editId ? "Update service details." : "Add a new service."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={serviceCategory} onValueChange={setServiceCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Price (INR)</Label>
              <Input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleServiceSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Tab */}
      {activeTab === "Account" && (
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Sign Out</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sign out of your account. You will need to log in again to access the dashboard.
              </p>
              <Button
                variant="destructive"
                className="mt-3"
                disabled={loggingOut}
                onClick={() => {
                  setLoggingOut(true);
                  signOut({ callbackUrl: "/login" });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {loggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Template" : "Add Template"}</DialogTitle>
            <DialogDescription>{editId ? "Update WhatsApp template." : "Create a new WhatsApp template."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={templateCategory} onChange={(e) => setTemplateCategory(e.target.value)} placeholder="e.g. Follow-up, After Meeting" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={templateMessage} onChange={(e) => setTemplateMessage(e.target.value)} rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTemplateSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
