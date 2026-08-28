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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#30351f]/45 backdrop-blur-sm p-4"
          onClick={() => setHistoryOpen(false)}
        >
          <div 
            className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/30 bg-[#F4F3EE] shadow-[0_20px_60px_rgba(35,40,22,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[#D9D8CD]">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#292D25]">
                    Upload History
                  </h2>
                  <p className="text-xs text-[#7A7C70]">
                    Manage your previously uploaded files
                  </p>
                </div>
              </div>

              <button
                onClick={() => setHistoryOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#77796C] transition-colors hover:bg-[#E3E2D8] hover:text-[#292D25]"
                aria-label="Close upload history"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            {/* History */}
            <div className="max-h-[calc(85vh-82px)] overflow-y-auto">
              <UploadHistory />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}