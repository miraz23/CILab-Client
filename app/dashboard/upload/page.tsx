"use client";

import { FileText, History, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import UploadStats from '@/components/dashboard/upload/UploadStats';
import UploadPaperForm from '@/components/dashboard/upload/UploadPaperForm';
import UploadPresentationForm from '@/components/dashboard/upload/UploadPresentationForm';
import UploadCategories from '@/components/dashboard/upload/UploadCategories';
import UploadHistory from '@/components/dashboard/upload/UploadHistory';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const router = useRouter();

  return (
    <section className='w-[95%] mx-auto py-5'>
      <div className="mb-6">
        <div className='flex items-center justify-between'>
          <h1 className="text-2xl font-bold text-white">Upload Papers & Presentations</h1>

          <div className='flex gap-1'>
            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="w-4 h-4" aria-hidden />
              <p className='hidden md:block'>History</p>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="w-4 h-4" aria-hidden />
              <p className='hidden md:block'>Reload</p>
            </Button>
          </div>
        </div>

        <p className="text-white/80 mt-1">Manage your research papers and presentation uploads</p>
      </div>

      <UploadStats />

      <div className="gap-4 w-full mt-6">
        <div className="space-y-6">
          <UploadPaperForm />
          <UploadPresentationForm />
        </div>
      </div>

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-4">
          <div
            className="w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
            style={{ maxHeight: "85vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#1C1D1D0D]">
                  <FileText className="w-5 h-5 text-[#716f49]" aria-hidden />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Upload History</h2>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <UploadHistory />
          </div>
        </div>
      )}
    </section>
  );
}