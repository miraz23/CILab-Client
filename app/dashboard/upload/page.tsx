"use client";

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import UploadStats from '@/components/dashboard/upload/UploadStats';
import UploadPaperForm from '@/components/dashboard/upload/UploadPaperForm';
import UploadPresentationForm from '@/components/dashboard/upload/UploadPresentationForm';
import UploadCategories from '@/components/dashboard/upload/UploadCategories';
import UploadHistory from '@/components/dashboard/upload/UploadHistory';

export default function UploadPage() {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <section className='w-[95%] mx-auto py-5'>
      <div>
        <div className='flex items-center justify-between'>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Upload Papers & Presentations</h1>
            <p className="text-white/80 mt-1">Manage your research papers and presentation uploads</p>
          </div>

          <Button
            variant="ghost"
            size="lg"
            className="gap-2 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            onClick={() => setHistoryOpen(true)}
          >
            <History className="w-4 h-4" aria-hidden />
            <p>History</p>
          </Button>
        </div>

        <UploadStats />

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 w-full mt-6">
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <UploadPaperForm />
            <UploadPresentationForm />
          </div>
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <UploadCategories />
          </div>
        </div>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 sm:max-w-3xl">
          <UploadHistory />
        </DialogContent>
      </Dialog>
    </section>
  );
}