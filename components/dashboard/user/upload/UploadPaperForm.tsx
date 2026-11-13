"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import {
  Upload,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UploadPaperForm() {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [authorsEmail, setAuthorsEmail] = useState("");
  const [publisher, setPublisher] = useState("");
  const [abstract, setAbstract] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [publicationLink, setPublicationLink] = useState("");
  const [publicationType, setPublicationType] = useState("");
  const [publicationVenue, setPublicationVenue] = useState("");
  const [indexedIn, setIndexedIn] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) return;

    if (file.type === "application/pdf") {
      setPdfFile(file);
      setUploadStatus("idle");
    } else {
      toast.error("Only PDF files are allowed.");
      setPdfFile(null);
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
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    noClick: true,
  });

  const removeFile = () => {
    setPdfFile(null);
    setUploadStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      toast.error("Please select a PDF file.");
      return;
    }

    if (!title.trim()) {
      toast.error("Paper title is required.");
      return;
    }

    if (!category) {
      toast.error("Please select a paper category.");
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

      formData.append("paper_file", pdfFile);
      formData.append("paper_title", title.trim());
      formData.append("authors_name", authors);
      formData.append("authors_email", authorsEmail);
      formData.append("paper_category", category);
      formData.append("publication_type", publicationType);
      formData.append("publication_venue", publicationVenue);
      formData.append("publisher", publisher.trim());
      formData.append("indexed_in", indexedIn);
      formData.append("publication_date", publicationDate);
      formData.append("paper_tags", tags);
      formData.append("paper_url", trimmedPublicationLink);
      formData.append("paper_abstract", abstract);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/papers/upload`,
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
      toast.success("Research paper uploaded successfully.");

      setTitle("");
      setAuthors("");
      setAuthorsEmail("");
      setPublisher("");
      setAbstract("");
      setCategory("");
      setTags("");
      setPublicationLink("");
      setPublicationType("");
      setPublicationVenue("");
      setIndexedIn("");
      setPublicationDate("");
      setPdfFile(null);
      window.dispatchEvent(new Event("uploads:changed"));
    } catch (error) {
      setUploadStatus("error");
      toast.error(
        error instanceof Error ? error.message : "Failed to upload paper. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-white/60 bg-[#F4F3EE]/95 backdrop-blur-xl">
      <CardContent className="min-w-0 p-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-6">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#202720]">
              Upload Research Paper
            </h2>

            <p className="mt-0.5 text-xs text-[#85897F]">
              Submit your research paper for review and archiving.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Paper Title
                  <span className="ml-1 text-[#B85C55]">
                    *
                  </span>
                </Label>

                <Input
                  id="title"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Enter paper title"
                  required
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none transition-all focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-semibold text-[#565D54]">
                  Paper Category
                  <span className="ml-1 text-[#B85C55]">*</span>
                </Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                  }}
                  placeholder="e.g. Machine Learning, Computer Vision"
                  required
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
                />
              </div>
            </div>

            {/* Authors */}
            <div className="space-y-2">
              <Label
                htmlFor="authors"
                className="text-xs font-semibold text-[#565D54]"
              >
                Authors
              </Label>

              <Input
                id="authors"
                value={authors}
                onChange={(e) =>
                  setAuthors(e.target.value)
                }
                placeholder="Author names, separated by commas"
                className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="authors-email"
                className="text-xs font-semibold text-[#565D54]"
              >
                Author Emails
              </Label>
              <Input
                id="authors-email"
                value={authorsEmail}
                onChange={(e) => setAuthorsEmail(e.target.value)}
                placeholder="Emails, separated by commas"
                className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="publication-type"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Publication Type
                </Label>
                <Input
                  id="publication-type"
                  value={publicationType}
                  onChange={(e) => setPublicationType(e.target.value)}
                  placeholder="e.g. journal"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="publication-venue"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Publication Venue
                </Label>
                <Input
                  id="publication-venue"
                  value={publicationVenue}
                  onChange={(e) => setPublicationVenue(e.target.value)}
                  placeholder="Journal or conference name"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Publisher */}
              <div className="space-y-2">
                <Label
                  htmlFor="publisher"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Publisher
                </Label>

                <Input
                  id="publisher"
                  value={publisher}
                  onChange={(e) =>
                    setPublisher(e.target.value)
                  }
                  placeholder="e.g. IEEE, Springer, Elsevier"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="indexed-in"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Indexed In
                </Label>
                <Input
                  id="indexed-in"
                  value={indexedIn}
                  onChange={(e) => setIndexedIn(e.target.value)}
                  placeholder="Scopus, Web of Science"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="publication-date"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Publication Date
                </Label>
                <Input
                  id="publication-date"
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label
                  htmlFor="tags"
                  className="text-xs font-semibold text-[#565D54]"
                >
                  Research Tags
                </Label>

                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) =>
                    setTags(e.target.value)
                  }
                  placeholder="e.g. cnn, gnn"
                  className="h-10 rounded-lg border-[#D7D8D0] bg-[#EBEAE3] text-sm text-[#252C26] placeholder:text-[#969A91] shadow-none focus-visible:border-[#858A69] focus-visible:ring-2 focus-visible:ring-[#858A69]/15"
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

            {/* Abstract */}
            <div className="space-y-2">
              <Label
                htmlFor="abstract"
                className="text-xs font-semibold text-[#565D54]"
              >
                Abstract
              </Label>

              <textarea
                id="abstract"
                value={abstract}
                onChange={(e) =>
                  setAbstract(e.target.value)
                }
                placeholder="Provide a brief summary of your research..."
                rows={5}
                className="w-full resize-none rounded-lg border border-[#D7D8D0] bg-[#EBEAE3] px-3 py-2.5 text-sm leading-relaxed text-[#252C26] focus:ring-[#858A69]/15"
              />
            </div>

          </div>

          {/* Divider */}
          <div className="border-t border-[#D7D8D0]" />

          {/* PDF Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#565D54]">
                Research Paper PDF
                <span className="ml-1 text-[#B85C55]">
                  *
                </span>
              </Label>

              <span className="text-[10px] text-[#92968D]">
                PDF · Maximum 50MB
              </span>
            </div>

            <div
              {...getRootProps()}
              className={`relative w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-dashed p-7 transition-all duration-200 ${isDragActive ? `border-[#68724D] bg-[#68724D]/8` : `border-[#C9CBC2] bg-[#ECEBE4] hover:border-[#8A906F] hover:bg-[#E8E8DF]`}`}
            >
              <input {...getInputProps()} />

              {pdfFile ? (
                <div className="flex w-full min-w-0 items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DDE5D8]">
                      <CheckCircle className="h-5 w-5 text-[#4F8A63]" strokeWidth={1.8} aria-hidden />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium text-[#293129]"
                        title={pdfFile.name}
                      >
                        {pdfFile.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#85897F]">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · PDF
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[#D5D7CE] bg-[#E2E2D9]">
                    <Upload
                      className="h-5 w-5 text-[#69734E]"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                  </div>

                  <p className="text-sm font-medium text-[#3E463D]">
                    {isDragActive
                      ? "Drop your paper here"
                      : "Upload your research paper"}
                  </p>

                  <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#8A8E85]">
                    Drag and drop your PDF here, or browse
                    your computer to select a file.
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
              Your submission will be reviewed before publication.
            </p>

            <Button
              type="submit"
              disabled={isUploading}
              className="h-10 rounded-[10px] bg-[#626C49] px-5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(64,73,42,0.18)] transition-all hover:bg-[#535D3D] hover:shadow-[0_6px_16px_rgba(64,73,42,0.22)] disabled:opacity-60"
            >
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
                  Upload Paper
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}