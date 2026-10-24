"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadHistory from "@/components/dashboard/user/upload/UploadHistory";

export default function MyPapersPage() {
  return (
    <section className="mx-auto w-[95%] py-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Papers</h1>
          <p className="mt-1 text-white/80">View and manage your uploaded papers and presentations.</p>
        </div>
        <Button
          variant="ghost"
          size="lg"
          className="gap-2 text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => window.dispatchEvent(new Event("uploads:changed"))}
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          <span className="hidden md:block">Reload</span>
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/30 bg-[#F4F3EE] shadow-[0_20px_60px_rgba(35,40,22,0.15)]">
        <UploadHistory />
      </div>
    </section>
  );
}
