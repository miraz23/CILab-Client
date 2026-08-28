"use client";

import React, { useState } from "react";
import {
  FileText,
  Presentation,
  Download,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadItem {
  id: string;
  title: string;
  type: "paper" | "presentation";
  category: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  fileUrl: string;
  fileSize: number;
}

const mockUploads: UploadItem[] = [
  {
    id: "1",
    title: "Attention Is All You Need: A Reproduction Study",
    type: "paper",
    category: "NLP",
    date: "2024-01-15",
    status: "approved",
    fileUrl: "#",
    fileSize: 2.4,
  },
  {
    id: "2",
    title: "Transformer Architectures for Computer Vision",
    type: "presentation",
    category: "Conference Talk",
    date: "2024-01-10",
    status: "pending",
    fileUrl: "#",
    fileSize: 5.1,
  },
  {
    id: "3",
    title: "Graph Neural Networks for Drug Discovery",
    type: "paper",
    category: "Graph Neural Networks",
    date: "2024-01-08",
    status: "rejected",
    fileUrl: "#",
    fileSize: 3.7,
  },
  {
    id: "4",
    title: "Efficient Training of Large Language Models",
    type: "presentation",
    category: "Workshop",
    date: "2024-01-05",
    status: "approved",
    fileUrl: "#",
    fileSize: 8.2,
  },
  {
    id: "5",
    title: "Self-Supervised Learning in Robotics",
    type: "paper",
    category: "Robotics",
    date: "2024-01-03",
    status: "pending",
    fileUrl: "#",
    fileSize: 4.5,
  },
];

export default function UploadHistory() {
  const [uploads, setUploads] = useState<UploadItem[]>(mockUploads);

  const [activeTab, setActiveTab] = useState<
    "all" | "papers" | "presentations"
  >("all");

  const filteredUploads = uploads.filter((upload) => {
    if (activeTab === "papers") {
      return upload.type === "paper";
    }

    if (activeTab === "presentations") {
      return upload.type === "presentation";
    }

    return true;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatFileSize = (mb: number) => `${mb} MB`;

  const getStatusBadge = (status: UploadItem["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            className="gap-1 border border-[#BBD7BF] bg-[#E7F1E8] text-[#3F7545] hover:bg-[#E7F1E8]"
          >
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );

      case "pending":
        return (
          <Badge
            className="gap-1 border border-[#DED2A9] bg-[#F4EFD9] text-[#8A7430] hover:bg-[#F4EFD9]"
          >
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );

      case "rejected":
        return (
          <Badge
            className="gap-1 border border-[#E1C0C0] bg-[#F6E8E8] text-[#A64A4A] hover:bg-[#F6E8E8]"
          >
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this upload?")) {
      setUploads((current) =>
        current.filter((upload) => upload.id !== id)
      );
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="px-6 py-4 border-b border-[#D9D8CD]">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(
              value as "all" | "papers" | "presentations"
            )
          }
        >
          <TabsList
            className="h-10 w-full sm:w-fit gap-1 rounded-xl border border-[#D5D4C9] bg-[#E8E7DD] p-1"
          >
            <TabsTrigger
              value="all"
              className="rounded-lg px-4 text-xs font-medium text-[#737568] transition-all data-[state=active]:bg-[#656748] data-[state=active]:text-white data-[state=active]:shadow-sm
              "
            >
              All ({uploads.length})
            </TabsTrigger>

            <TabsTrigger
              value="papers"
              className="rounded-lg px-4 text-xs font-medium text-[#737568] transition-all data-[state=active]:bg-[#656748] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Papers ({uploads.filter((u) => u.type === "paper").length})
            </TabsTrigger>

            <TabsTrigger
              value="presentations"
              className="rounded-lg px-4 text-xs font-medium text-[#737568] transition-all data-[state=active]:bg-[#656748] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Presentations (
              {uploads.filter((u) => u.type === "presentation").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Upload List */}
      <div className="px-4 py-3 sm:px-6">
        <div className="space-y-2">
          {filteredUploads.map((upload) => {
            const isPaper = upload.type === "paper";

            return (
              <div
                key={upload.id}
                className="group rounded-xl border border-[#D9D8CD] bg-[#F7F6F1] px-4 py-4 transition-all hover:border-[#C7C6B8] hover:bg-[#FAF9F5]"
              >
                <div className="flex items-start gap-3">
                  {/* Main Content */}
                  <div className="min-w-0 flex-1">
                    {/* Title + Status */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="truncate pr-2 text-sm font-semibold text-[#292D25]">
                        {upload.title}
                      </p>

                      {getStatusBadge(upload.status)}
                    </div>

                    {/* Metadata */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7B7D72]">
                      <span>{upload.category}</span>

                      <span className="text-[#B1B2A8]">•</span>

                      <span>{formatDate(upload.date)}</span>

                      <span className="text-[#B1B2A8]">•</span>

                      <span>{formatFileSize(upload.fileSize)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex shrink-0 items-center gap-1"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-[#737568] hover:bg-[#E8E7DD] hover:text-[#55573E]"
                      onClick={() =>
                        window.open(upload.fileUrl, "_blank")
                      }
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-[#737568] hover:bg-[#E8E7DD] hover:text-[#55573E]"
                      onClick={() =>
                        window.open(upload.fileUrl, "_blank")
                      }
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-[#9A6B6B] hover:bg-[#F3E4E4] hover:text-[#A64A4A]"
                      onClick={() => handleDelete(upload.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredUploads.length === 0 && (
            <div
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CFCFC2] bg-[#F7F6F1] py-14"
            >
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8E7DD]"
              >
                <FileText className="h-5 w-5 text-[#7A7C70]" />
              </div>

              <p className="text-sm font-medium text-[#4B4D42]">
                No uploads found
              </p>

              <p className="mt-1 text-xs text-[#8A8C81]">
                Uploaded papers and presentations will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}