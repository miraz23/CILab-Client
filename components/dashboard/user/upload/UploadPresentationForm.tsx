"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import {
  Presentation,
  Upload,
  CheckCircle,
  Loader2,
  FileText,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function UploadPresentationForm() {
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [presenterNames, setPresenterNames] = useState("");
  const [presenterEmails, setPresenterEmails] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [publicationLink, setPublicationLink] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");


  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];

    if (!uploadedFile) return;

    if (allowedMimeTypes.includes(uploadedFile.type)) {
      setFile(uploadedFile);
      setUploadStatus("idle");
    } else {
      toast.error(
        "Only PDF, PPT, or PPTX files are allowed."
      );
      setFile(null);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    noClick: true,
  });

  const removeFile = () => {
    setFile(null);
    setUploadStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a presentation file.");
      return;
    }

    if (!title.trim()) {
      toast.error("Presentation title is required.");
      return;
    }

    if (!type) {
      toast.error("Please select a presentation type.");
      return;
    }

    const trimmedPublicationLink = publicationLink.trim();

    if (trimmedPublicationLink) {
      try {
        new URL(trimmedPublicationLink);
      } catch {
        toast.error(
          "Please enter a valid publication link, e.g. https://doi.org/10.1000/xyz123."
        );
        return;
      }
    }

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();

      formData.append("presentation_file", file);
      formData.append("presentation_title", title.trim());
      formData.append("presenter_name", presenterNames);
      formData.append("presenter_email", presenterEmails);
      formData.append("presentation_category", category);
      formData.append("presentation_event", type);
      formData.append("event_name", event);
      formData.append("presentation_date", date);
      formData.append("presentation_tags", tags);
      formData.append("paper_url", trimmedPublicationLink);
      formData.append("presentation_description", description);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/presentations/upload`,
        {
          method: "POST",
          headers: {
            ...(localStorage.getItem("token")
              ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
              : {}),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Upload failed");
      }

      setUploadStatus("success");
      toast.success("Presentation uploaded successfully.");

      setTitle("");
      setEvent("");
      setDate("");
      setType("");
      setCategory("");
      setPresenterNames("");
      setPresenterEmails("");
      setTags("");
      setDescription("");
      setFile(null);
      window.dispatchEvent(new Event("uploads:changed"));
    } catch (error) {
      setUploadStatus("error");
      toast.error(
        error instanceof Error ? error.message : "Failed to upload presentation. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full rounded-lg border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl"
    >
      <CardContent className="p-5">

        {/* Header */}
        <div className="flex items-center gap-3 pb-6">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#202720]">
              Upload Presentation
            </h2>

            <p className="mt-0.5 text-xs text-[#85897F]">
              Add your presentation for lab archiving and review.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">

            {/* Title + Type */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div className="space-y-2">
                <Label
                  htmlFor="pres-title"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Presentation Title
                  <span className="ml-1 text-[#B85C55]">
                    *
                  </span>
                </Label>

                <Input
                  id="pres-title"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Enter presentation title"
                  required
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none transition-all focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pres-type" className="text-xs font-semibold text-[#565D54]">
                  Presentation Event
                  <span className="ml-1 text-[#B85C55]">*</span>
                </Label>
                <Input
                  id="pres-type"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                  }}
                  placeholder="e.g. Seminar, Thesis, Conference"
                  required
                  className="h-10 w-full rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="pres-event"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Event name
                </Label>

                <Input
                  id="pres-event"
                  value={event}
                  onChange={(e) =>
                    setEvent(e.target.value)
                  }
                  placeholder="e.g. NeurIPS 2026, CVPR Workshop"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="presentation-category"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Presentation Category
                </Label>
                <Input
                  id="presentation-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="AI, computer vision, robotics"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="presenter-name"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Presenter Names
                </Label>
                <Input
                  id="presenter-name"
                  value={presenterNames}
                  onChange={(e) => setPresenterNames(e.target.value)}
                  placeholder="Names, separated by commas"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="presenter-email"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Presenter Emails
                </Label>
                <Input
                  id="presenter-email"
                  value={presenterEmails}
                  onChange={(e) => setPresenterEmails(e.target.value)}
                  placeholder="Emails, separated by commas"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="pres-date"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Presentation Date
                </Label>

                <Input
                  id="pres-date"
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="pres-tags"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Presentation Tags
                </Label>
                <Input
                  id="pres-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="AI, computer vision, research"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>
            </div>

            {/* Publication Link */}
            <div className="space-y-2">
              <Label
                htmlFor="publicationLink"
                className="text-xs font-semibold text-[#565D54]"
              >
                Publication Link
              </Label>

              <Input
                id="publicationLink"
                type="url"
                value={publicationLink}
                onChange={(e) =>
                  setPublicationLink(e.target.value)
                }
                placeholder="e.g. https://doi.org/10.1000/xyz123 or publisher page"
                className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="pres-desc"
                className="text-xs font-semibold text-[#565D54]"
              >
                Description
              </Label>

              <textarea
                id="pres-desc"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Provide a brief description of the presentation..."
                rows={5}
                className="w-full resize-none rounded-lg border border-[#D7D8D0] bg-[#EBEAE3] px-3 py-2.5 text-sm leading-relaxed text-[#252C26] placeholder:text-[#969A91] outline-none transition-all focus:border-[#B77C29] focus:ring-2 focus:ring-[#B77C29]/15"
              />
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-[#D7D8D0]" />

          {/* File Upload */}
          <div className="space-y-2">

            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#565D54]">
                Presentation File
                <span className="ml-1 text-[#B85C55]">
                  *
                </span>
              </Label>

              <span className="text-[10px] text-[#92968D]">
                PDF · PPT · PPTX · Maximum 50MB
              </span>
            </div>

            <div
              {...getRootProps()}
              className={`relative overflow-hidden rounded-lg border border-dashed p-7 transition-all duration-200
                ${isDragActive
                  ? `border-[#B77C29] bg-[#B77C29]/8`
                  : `border-[#C9CBC2] bg-[#ECEBE4] hover:border-[#B77C29] hover:bg-[#E9E7DE]`
                }`}
            >
              <input {...getInputProps()} />

              {file ? (
                <div className="flex items-center justify-between gap-4">

                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ECE1C9]"
                    >
                      <CheckCircle
                        className="h-5 w-5 text-[#B77C29]"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#293129]">
                        {file.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#85897F]">
                        {(file.size / 1024 / 1024).toFixed(2)}{" "} MB · Presentation file
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#85897F] transition-colors hover:bg-[#DCDDD5] hover:text-[#B85C55]"
                    aria-label="Remove file"
                  >
                    <X
                      className="h-4 w-4"
                      aria-hidden
                    />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#D8D4C8] bg-[#E4E0D5]">
                    <FileText
                      className="h-5 w-5 text-[#B77C29]"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                  </div>

                  <p className="text-sm font-medium text-[#3E463D]">
                    {isDragActive
                      ? "Drop your presentation here"
                      : "Upload your presentation"}
                  </p>

                  <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#8A8E85]">
                    Drag and drop your PDF, PPT, or PPTX
                    file here, or browse your computer.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={open}
                    className="mt-4 h-9 rounded-lg border-[#C9CBC2] bg-[#F4F3EE] px-4 text-xs font-medium text-[#4C5548] shadow-none hover:bg-[#E3E4DB] hover:text-[#30382F]"
                  >
                    Browse File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#D7D8D0] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#92968D]">
              Your presentation will be reviewed before archiving.
            </p>

            <Button
              type="submit"
              disabled={isUploading}
              className="h-10 rounded-lg bg-[#626C49] px-5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(64,73,42,0.18)] transition-all hover:bg-[#535D3D] hover:shadow-[0_6px_16px_rgba(64,73,42,0.22)]disabled:opacity-60">
              {isUploading ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden
                  />
                  Uploading...
                </>
              ) : uploadStatus === "success" ? (
                <>
                  <CheckCircle
                    className="mr-2 h-4 w-4"
                    aria-hidden
                  />
                  Uploaded Successfully
                </>
              ) : (
                <>
                  <Upload
                    className="mr-2 h-4 w-4"
                    aria-hidden
                  />
                  Upload Presentation
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}