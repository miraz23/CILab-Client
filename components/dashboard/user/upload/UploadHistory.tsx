"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Presentation,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { confirmAction } from "@/lib/confirm";

type UploadType = "paper" | "presentation";
type UploadStatus = "pending" | "approved" | "rejected";

interface UploadItem {
  id: string;
  title: string;
  upload_type: UploadType;
  metadata: Record<string, string>;
  original_filename: string;
  cloudinary_url: string;
  status: UploadStatus;
  file_size: number;
  created_at: string;
}

interface EditState {
  id: string;
  type: UploadType;
  title: string;
  categoryOrType: string;
  authors: string;
  event: string;
  date: string;
  tags: string;
  abstractOrDescription: string;
  publicationLink: string;
}

const PAPER_CATEGORIES = [
  "Machine Learning", "Computer Vision", "NLP", "Graph Neural Networks",
  "Optimization", "Robotics", "Reinforcement Learning", "Other",
];
const PRESENTATION_TYPES = [
  "Conference Talk", "Workshop", "Seminar", "Poster Session", "Demo Session",
  "Tutorial", "Keynote", "Panel Discussion", "Other",
];

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function UploadHistory() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | UploadType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadUploads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploads`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Unable to load your uploads.");
      setUploads(data.uploads ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load your uploads.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadUploads, 0);
    window.addEventListener("uploads:changed", loadUploads);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("uploads:changed", loadUploads);
    };
  }, [loadUploads]);

  const filteredUploads = uploads.filter((upload) => activeTab === "all" || upload.upload_type === activeTab);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
  const formatFileSize = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const openEditor = (upload: UploadItem) => {
    const metadata = upload.metadata ?? {};
    setEditing({
      id: upload.id,
      type: upload.upload_type,
      title: upload.title,
      categoryOrType: upload.upload_type === "paper" ? metadata.category ?? "" : metadata.presentationType ?? "",
      authors: metadata.authors ?? "",
      event: metadata.event ?? "",
      date: metadata.date ?? "",
      tags: metadata.tags ?? "",
      abstractOrDescription: upload.upload_type === "paper" ? metadata.abstract ?? "" : metadata.description ?? "",
      publicationLink: metadata.publicationLink ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!await confirmAction({
      title: "Delete this upload?",
      text: "This will permanently remove the uploaded file.",
      icon: "warning",
      confirmText: "Delete",
      tone: "danger",
    })) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploads/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Unable to delete this upload.");
      setUploads((current) => current.filter((upload) => upload.id !== id));
      window.dispatchEvent(new Event("uploads:changed"));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete this upload.");
    }
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setIsSaving(true);
    setErrorMessage("");
    const body = editing.type === "paper"
      ? {
          title: editing.title, authors: editing.authors, abstract: editing.abstractOrDescription,
          category: editing.categoryOrType, tags: editing.tags, publicationLink: editing.publicationLink,
        }
      : {
          title: editing.title, event: editing.event, date: editing.date, type: editing.categoryOrType,
          description: editing.abstractOrDescription, publicationLink: editing.publicationLink,
        };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploads/${editing.id}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Unable to update this upload.");
      setUploads((current) => current.map((upload) => upload.id === editing.id ? data.upload : upload));
      setEditing(null);
      window.dispatchEvent(new Event("uploads:changed"));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update this upload.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: UploadStatus) => {
    const config = {
      approved: { label: "Approved", icon: CheckCircle, className: "border-[#BBD7BF] bg-[#E7F1E8] text-[#3F7545]" },
      pending: { label: "Pending", icon: Clock, className: "border-[#DED2A9] bg-[#F4EFD9] text-[#8A7430]" },
      rejected: { label: "Rejected", icon: XCircle, className: "border-[#E1C0C0] bg-[#F6E8E8] text-[#A64A4A]" },
    }[status];
    const Icon = config.icon;
    return <Badge className={`gap-1 border hover:bg-inherit ${config.className}`}><Icon className="h-3 w-3" />{config.label}</Badge>;
  };

  return (
    <div className="w-full">
      <div className="border-b border-[#D9D8CD] px-6 py-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | UploadType)}>
          <TabsList className="h-10 w-full gap-1 rounded-xl border border-[#D5D4C9] bg-[#E8E7DD] p-1 sm:w-fit">
            <TabsTrigger value="all" className="rounded-lg px-4 text-xs text-[#737568] data-[state=active]:bg-[#656748] data-[state=active]:text-white">All ({uploads.length})</TabsTrigger>
            <TabsTrigger value="paper" className="rounded-lg px-4 text-xs text-[#737568] data-[state=active]:bg-[#656748] data-[state=active]:text-white">Papers ({uploads.filter((u) => u.upload_type === "paper").length})</TabsTrigger>
            <TabsTrigger value="presentation" className="rounded-lg px-4 text-xs text-[#737568] data-[state=active]:bg-[#656748] data-[state=active]:text-white">Presentations ({uploads.filter((u) => u.upload_type === "presentation").length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 py-3 sm:px-6">
        {errorMessage && <p className="mb-3 rounded-lg bg-[#F6E8E8] px-3 py-2 text-xs text-[#A64A4A]">{errorMessage}</p>}
        {isLoading ? (
          <div className="flex justify-center py-14"><Loader2 className="h-6 w-6 animate-spin text-[#656748]" /></div>
        ) : filteredUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CFCFC2] bg-[#F7F6F1] py-14">
            <FileText className="mb-3 h-5 w-5 text-[#7A7C70]" />
            <p className="text-sm font-medium text-[#4B4D42]">No uploads found</p>
            <p className="mt-1 text-xs text-[#8A8C81]">Uploaded papers and presentations will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUploads.map((upload) => {
              const isPaper = upload.upload_type === "paper";
              const category = isPaper ? upload.metadata?.category : upload.metadata?.presentationType;
              const Icon = isPaper ? FileText : Presentation;
              return (
                <div key={upload.id} className="rounded-xl border border-[#D9D8CD] bg-[#F7F6F1] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#656748]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="truncate pr-2 text-sm font-semibold text-[#292D25]">{upload.title}</p>
                        {getStatusBadge(upload.status)}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#7B7D72]">
                        <span>{category || (isPaper ? "Paper" : "Presentation")}</span><span>•</span>
                        <span>{formatDate(upload.created_at)}</span><span>•</span><span>{formatFileSize(upload.file_size)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737568]" onClick={() => window.open(upload.cloudinary_url, "_blank")} title="Preview"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737568]" onClick={() => window.open(upload.cloudinary_url, "_blank")} title="Download"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737568]" onClick={() => openEditor(upload)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9A6B6B]" onClick={() => handleDelete(upload.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#30351f]/45 p-4" onClick={() => !isSaving && setEditing(null)}>
          <form className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-[#F4F3EE] p-6 shadow-2xl" onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}>
            <div><h2 className="text-lg font-semibold text-[#292D25]">Edit {editing.type === "paper" ? "paper" : "presentation"}</h2><p className="text-xs text-[#7A7C70]">Update the uploaded file details.</p></div>
            <div className="space-y-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} required /></div>
            <div className="space-y-2"><Label htmlFor="edit-category">{editing.type === "paper" ? "Category" : "Presentation type"}</Label><select id="edit-category" className="h-10 w-full rounded-md border border-[#D7D8D0] bg-white px-3 text-sm" value={editing.categoryOrType} onChange={(event) => setEditing({ ...editing, categoryOrType: event.target.value })} required><option value="">Select one</option>{(editing.type === "paper" ? PAPER_CATEGORIES : PRESENTATION_TYPES).map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
            {editing.type === "paper" ? (
              <>
                <div className="space-y-2"><Label htmlFor="edit-authors">Authors</Label><Input id="edit-authors" value={editing.authors} onChange={(event) => setEditing({ ...editing, authors: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="edit-tags">Tags</Label><Input id="edit-tags" value={editing.tags} onChange={(event) => setEditing({ ...editing, tags: event.target.value })} /></div>
              </>
            ) : (
              <>
                <div className="space-y-2"><Label htmlFor="edit-event">Event</Label><Input id="edit-event" value={editing.event} onChange={(event) => setEditing({ ...editing, event: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="edit-date">Date</Label><Input id="edit-date" type="date" value={editing.date} onChange={(event) => setEditing({ ...editing, date: event.target.value })} /></div>
              </>
            )}
            <div className="space-y-2"><Label htmlFor="edit-description">{editing.type === "paper" ? "Abstract" : "Description"}</Label><textarea id="edit-description" className="min-h-24 w-full rounded-md border border-[#D7D8D0] bg-white px-3 py-2 text-sm" value={editing.abstractOrDescription} onChange={(event) => setEditing({ ...editing, abstractOrDescription: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="edit-link">Publication link</Label><Input id="edit-link" type="url" value={editing.publicationLink} onChange={(event) => setEditing({ ...editing, publicationLink: event.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={isSaving}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button></div>
          </form>
        </div>
      )}
    </div>
  );
}
