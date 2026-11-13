"use client";

import { toast } from "react-toastify";
import ReviewNote from "@/components/dashboard/ReviewNote";
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
import { UploadHistoryRowsSkeleton } from "@/components/dashboard/skeleton-loader/UploadHistorySkeleton";
import { confirmAction } from "@/lib/confirm";

type UploadType = "paper" | "presentation";
type UploadStatus = "pending" | "approved" | "rejected";

interface UploadItem {
  id: string;
  title: string;
  upload_type: UploadType;
  metadata: Record<string, string | string[] | boolean>;
  original_filename: string;
  mime_type: string;
  cloudinary_url: string;
  status: UploadStatus;
  review_note?: string;
  /** The API returns this as a numeric string. */
  file_size: number | string;
  created_at: string;
  is_owner: boolean;
}

interface EditState {
  id: string;
  type: UploadType;
  title: string;
  originalFilename: string;
  replacementFile: File | null;
  /** Keyed by the same metadata/payload keys the upload forms send. */
  fields: Record<string, string>;
}

interface EditField {
  key: string;
  label: string;
  type?: "text" | "date" | "url" | "textarea";
  required?: boolean;
  full?: boolean;
  placeholder?: string;
}

// Mirrors the fields collected by UploadPaperForm (title is handled separately).
const PAPER_FIELDS: EditField[] = [
  { key: "paper_category", label: "Paper Category", required: true, placeholder: "e.g. Machine Learning" },
  { key: "authors_name", label: "Authors", placeholder: "Author names, separated by commas" },
  { key: "authors_email", label: "Author Emails", placeholder: "Emails, separated by commas" },
  { key: "publication_type", label: "Publication Type", placeholder: "e.g. journal" },
  { key: "publication_venue", label: "Publication Venue", placeholder: "Journal or conference name" },
  { key: "publisher", label: "Publisher", placeholder: "e.g. IEEE, Springer, Elsevier" },
  { key: "indexed_in", label: "Indexed In", placeholder: "Scopus, Web of Science" },
  { key: "publication_date", label: "Publication Date", type: "date" },
  { key: "paper_tags", label: "Research Tags", placeholder: "e.g. cnn, gnn" },
  { key: "paper_url", label: "Publication Link", type: "url", full: true },
  { key: "paper_abstract", label: "Abstract", type: "textarea", full: true },
];

// Mirrors the fields collected by UploadPresentationForm (title is handled separately).
const PRESENTATION_FIELDS: EditField[] = [
  { key: "presentation_event", label: "Presentation Event", required: true, placeholder: "e.g. Seminar, Thesis, Conference" },
  { key: "event_name", label: "Event Name", placeholder: "e.g. NeurIPS 2026" },
  { key: "presentation_category", label: "Presentation Category", placeholder: "AI, computer vision, robotics" },
  { key: "presenter_name", label: "Presenter Names", placeholder: "Names, separated by commas" },
  { key: "presenter_email", label: "Presenter Emails", placeholder: "Emails, separated by commas" },
  { key: "presentation_date", label: "Presentation Date", type: "date" },
  { key: "presentation_tags", label: "Presentation Tags", placeholder: "AI, computer vision, research" },
  { key: "paper_url", label: "Publication Link", type: "url", full: true },
  { key: "presentation_description", label: "Description", type: "textarea", full: true },
];

const fieldsFor = (type: UploadType) => (type === "paper" ? PAPER_FIELDS : PRESENTATION_FIELDS);
const INPUT_CLASS = "h-10 w-full rounded-lg border border-[#D7D8D0] bg-white px-3 text-sm";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function metadataText(value: string | string[] | boolean | undefined): string {
  return Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : "";
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
  const formatFileSize = (bytes: number | string) => `${(Number(bytes) / (1024 * 1024)).toFixed(1)} MB`;

  const openEditor = (upload: UploadItem) => {
    const metadata = upload.metadata ?? {};
    const fields: Record<string, string> = {};
    fieldsFor(upload.upload_type).forEach(({ key }) => {
      fields[key] = metadataText(metadata[key]);
    });
    setEditing({
      id: upload.id,
      type: upload.upload_type,
      title: upload.title,
      originalFilename: upload.original_filename,
      replacementFile: null,
      fields,
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

  const handleFileAction = async (upload: UploadItem, action: "preview" | "download") => {
    const isNonPdfPresentation =
      upload.upload_type === "presentation" && upload.mime_type !== "application/pdf";

    if (action === "preview" && !isNonPdfPresentation) {
      window.open(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/research/${upload.id}/preview`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}${upload.cloudinary_url}`,
        { headers: authHeaders() }
      );
      if (!response.ok) throw new Error("Unable to retrieve the uploaded file.");

      const fileUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = upload.original_filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to retrieve the uploaded file.");
    }
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setIsSaving(true);
    setErrorMessage("");
    const isPaper = editing.type === "paper";
    const body: BodyInit = (() => {
      const formData = new FormData();
      formData.append(isPaper ? "paper_title" : "presentation_title", editing.title);
      Object.entries(editing.fields).forEach(([key, value]) => formData.append(key, value));
      if (editing.replacementFile) {
        formData.append(isPaper ? "paper_file" : "presentation_file", editing.replacementFile);
      }
      return formData;
    })();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/uploads/${editing.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Unable to update this upload.");
      setUploads((current) => current.map((upload) => upload.id === editing.id ? data.upload : upload));
      toast.success(editing.replacementFile ? "File replaced successfully." : "Upload updated successfully.");
      setEditing(null);
      window.dispatchEvent(new Event("uploads:changed"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update this upload.";
      setErrorMessage(message);
      toast.error(message);
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
          <TabsList className="h-10 w-full gap-1 rounded-lg border border-[#D5D4C9] bg-[#E8E7DD] p-1 sm:w-fit">
            <TabsTrigger value="all" className="rounded-lg px-4 text-xs text-[#737568] data-[state=active]:bg-[#656748] data-[state=active]:text-white">All ({uploads.length})</TabsTrigger>
            <TabsTrigger value="paper" className="rounded-lg px-4 text-xs text-[#737568] data-[state=active]:bg-[#656748] data-[state=active]:text-white">Papers ({uploads.filter((u) => u.upload_type === "paper").length})</TabsTrigger>
            <TabsTrigger value="presentation" className="rounded-lg px-4 text-xs text-[#737568] data-[state=active]:bg-[#656748] data-[state=active]:text-white">Presentations ({uploads.filter((u) => u.upload_type === "presentation").length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 py-3 sm:px-6">
        {errorMessage && <p className="mb-3 rounded-lg bg-[#F6E8E8] px-3 py-2 text-xs text-[#A64A4A]">{errorMessage}</p>}
        {isLoading ? (
          <UploadHistoryRowsSkeleton />
        ) : filteredUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#CFCFC2] bg-[#F7F6F1] py-14">
            <FileText className="mb-3 h-5 w-5 text-[#7A7C70]" />
            <p className="text-sm font-medium text-[#4B4D42]">No uploads found</p>
            <p className="mt-1 text-xs text-[#8A8C81]">Uploaded papers and presentations will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUploads.map((upload) => {
              const isPaper = upload.upload_type === "paper";
              const category = metadataText(upload.metadata?.[isPaper ? "paper_category" : "presentation_category"]);
              const Icon = isPaper ? FileText : Presentation;
              return (
                <div key={upload.id} className="rounded-lg border border-[#D9D8CD] bg-[#F7F6F1] px-4 py-4">
                  <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#656748]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="truncate pr-2 text-sm font-semibold text-[#292D25]">{upload.title}</p>
                        <p>{getStatusBadge(upload.status)}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#7B7D72]">
                        <span>{category || (isPaper ? "Paper" : "Presentation")}</span><span>•</span>
                        <span>{formatDate(upload.created_at)}</span><span>•</span><span>{formatFileSize(upload.file_size)}</span>
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 items-center justify-end gap-1 border-t border-[#E4E3D9] pt-2 sm:w-auto sm:border-0 sm:pt-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737568]" onClick={() => handleFileAction(upload, "preview")} title={upload.upload_type === "presentation" && upload.mime_type !== "application/pdf" ? "Download" : "Preview"}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737568]" onClick={() => handleFileAction(upload, "download")} title="Download"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#737568]" onClick={() => openEditor(upload)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9A6B6B]" onClick={() => handleDelete(upload.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {upload.review_note && (
                    <ReviewNote className="mt-3" note={upload.review_note} status={upload.status} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#30351f]/45 p-4" onClick={() => !isSaving && setEditing(null)}>
          <form className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-lg bg-[#F4F3EE] p-6 shadow-2xl" onSubmit={saveEdit} onClick={(event) => event.stopPropagation()}>
            <div><h2 className="text-lg font-semibold text-[#292D25]">Edit {editing.type === "paper" ? "paper" : "presentation"}</h2><p className="text-xs text-[#7A7C70]">Update the uploaded file details.</p></div>
            <div className="space-y-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} required /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fieldsFor(editing.type).map((field) => {
                const id = `edit-${field.key}`;
                const value = editing.fields[field.key] ?? "";
                const onChange = (next: string) =>
                  setEditing({ ...editing, fields: { ...editing.fields, [field.key]: next } });
                return (
                  <div key={field.key} className={`space-y-2 ${field.full ? "sm:col-span-2" : ""}`}>
                    <Label htmlFor={id}>{field.label}{field.required && <span className="ml-1 text-[#B85C55]">*</span>}</Label>
                    {field.type === "textarea" ? (
                      <textarea id={id} rows={4} className="w-full resize-none rounded-lg border border-[#D7D8D0] bg-white px-3 py-2 text-sm" value={value} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} required={field.required} />
                    ) : (
                      <input id={id} type={field.type ?? "text"} className={INPUT_CLASS} value={value} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} required={field.required} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 rounded-lg border border-[#D7D8D0] bg-white px-3 py-3">
                <Label htmlFor="edit-upload-file">
                  {editing.type === "paper" ? "Research paper PDF" : "Presentation file"}
                </Label>
                <p className="truncate text-xs text-[#6F7267]" title={editing.originalFilename}>Current file: {editing.originalFilename}</p>
                <input
                  id="edit-upload-file"
                  type="file"
                  accept={editing.type === "paper" ? "application/pdf,.pdf" : "application/pdf,.pdf,.ppt,.pptx"}
                  className="block w-full text-xs text-[#565D54] file:mr-3 file:rounded-md file:border-0 file:bg-[#E8E7DD] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#565D54]"
                  onChange={(event) => setEditing({ ...editing, replacementFile: event.target.files?.[0] ?? null })}
                />
                <p className="text-[11px] text-[#85897F]">
                  Choose a file only if you want to replace the current {editing.type === "paper" ? "paper PDF" : "presentation"}.
                </p>
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={isSaving}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button></div>
          </form>
        </div>
      )}
    </div>
  );
}
