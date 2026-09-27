"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Presentation,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const presentationTypes = [
  "Conference Talk",
  "Workshop",
  "Seminar",
  "Poster Session",
  "Demo Session",
  "Tutorial",
  "Keynote",
  "Panel Discussion",
  "Other",
];

export default function UploadPresentationForm() {
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [errorMessage, setErrorMessage] = useState("");

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
      setErrorMessage("");
      setUploadStatus("idle");
    } else {
      setErrorMessage(
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
    setErrorMessage("");
    setUploadStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage("Please select a presentation file.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Presentation title is required.");
      return;
    }

    if (!type) {
      setErrorMessage("Please select a presentation type.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("title", title);
      formData.append("event", event);
      formData.append("date", date);
      formData.append("type", type);
      formData.append("description", description);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/presentations/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadStatus("success");

      setTitle("");
      setEvent("");
      setDate("");
      setType("");
      setDescription("");
      setFile(null);
    } catch {
      setUploadStatus("error");
      setErrorMessage(
        "Failed to upload presentation. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full rounded-[20px] border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl"
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
                  className="h-10 rounded-[10px] border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none transition-all focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="pres-type"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Presentation Type
                  <span className="ml-1 text-[#B85C55]">
                    *
                  </span>
                </Label>

                <Select
                  value={type}
                  onValueChange={(value: string | null) => {
                    setType(value ?? "");
                    setErrorMessage("");
                  }}
                >
                  <SelectTrigger
                    id="pres-type"
                    className="h-10 w-full rounded-[10px] border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] shadow-none focus:ring-2 focus:ring-[#B77C29]/15"
                  >
                    <SelectValue placeholder="Select presentation type" />
                  </SelectTrigger>

                  <SelectContent>
                    {presentationTypes.map((item) => (
                      <SelectItem
                        key={item}
                        value={item}
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Event + Date */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div className="space-y-2">
                <Label
                  htmlFor="pres-event"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Event / Conference
                </Label>

                <Input
                  id="pres-event"
                  value={event}
                  onChange={(e) =>
                    setEvent(e.target.value)
                  }
                  placeholder="e.g. NeurIPS 2026, CVPR Workshop"
                  className="h-10 rounded-[10px] border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>

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
                  className="h-10 rounded-[10px] border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] shadow-none focus-visible:border-[#B77C29] focus-visible:ring-2 focus-visible:ring-[#B77C29]/15"
                />
              </div>
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
                className="w-full resize-none rounded-[10px] border border-[#D7D8D0] bg-[#EBEAE3] px-3 py-2.5 text-sm leading-relaxed text-[#252C26] placeholder:text-[#969A91] outline-none transition-all focus:border-[#B77C29] focus:ring-2 focus:ring-[#B77C29]/15"
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
              className={`relative overflow-hidden rounded-[14px] border border-dashed p-7 transition-all duration-200
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
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#ECE1C9]"
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
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[#85897F] transition-colors hover:bg-[#DCDDD5] hover:text-[#B85C55]"
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

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#D8D4C8] bg-[#E4E0D5]">
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
                    className="mt-4 h-9 rounded-[9px] border-[#C9CBC2] bg-[#F4F3EE] px-4 text-xs font-medium text-[#4C5548] shadow-none hover:bg-[#E3E4DB] hover:text-[#30382F]"
                  >
                    Browse File
                  </Button>
                </div>
              )}
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-[9px] border border-[#E6C9C6] bg-[#F6E9E7] px-3 py-2 text-xs text-[#A84D47]">
                <AlertCircle
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                />

                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success */}
            {uploadStatus === "success" && (
              <div className="flex items-center gap-2 rounded-[9px] border border-[#C8D9CB] bg-[#EAF1EB] px-3 py-2 text-xs text-[#4F8A63]">
                <CheckCircle
                  className="h-4 w-4 shrink-0"
                  aria-hidden
                />

                <span>
                  Presentation uploaded successfully.
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#D7D8D0] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#92968D]">
              Your presentation will be reviewed before archiving.
            </p>

            <Button
              type="submit"
              disabled={isUploading}
              className="h-10 rounded-[10px] bg-[#626C49] px-5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(64,73,42,0.18)] transition-all hover:bg-[#535D3D] hover:shadow-[0_6px_16px_rgba(64,73,42,0.22)]disabled:opacity-60">
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