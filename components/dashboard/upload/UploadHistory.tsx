"use client";

import React, { useState } from 'react';
import { FileText, Presentation, Download, Eye, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UploadItem {
  id: string;
  title: string;
  type: 'paper' | 'presentation';
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  fileUrl: string;
  fileSize: number;
}

const mockUploads: UploadItem[] = [
  { id: '1', title: 'Attention Is All You Need: A Reproduction Study', type: 'paper', category: 'NLP', date: '2024-01-15', status: 'approved', fileUrl: '#', fileSize: 2.4 },
  { id: '2', title: 'Transformer Architectures for Computer Vision', type: 'presentation', category: 'Conference Talk', date: '2024-01-10', status: 'pending', fileUrl: '#', fileSize: 5.1 },
  { id: '3', title: 'Graph Neural Networks for Drug Discovery', type: 'paper', category: 'Graph Neural Networks', date: '2024-01-08', status: 'rejected', fileUrl: '#', fileSize: 3.7 },
  { id: '4', title: 'Efficient Training of Large Language Models', type: 'presentation', category: 'Workshop', date: '2024-01-05', status: 'approved', fileUrl: '#', fileSize: 8.2 },
  { id: '5', title: 'Self-Supervised Learning in Robotics', type: 'paper', category: 'Robotics', date: '2024-01-03', status: 'pending', fileUrl: '#', fileSize: 4.5 },
];

export default function UploadHistory() {
  const [uploads, setUploads] = useState<UploadItem[]>(mockUploads);
  const [activeTab, setActiveTab] = useState<'all' | 'papers' | 'presentations'>('all');

  const filteredUploads = uploads.filter((upload) => {
    if (activeTab === 'papers') return upload.type === 'paper';
    if (activeTab === 'presentations') return upload.type === 'presentation';
    return true;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatFileSize = (mb: number) => `${mb} MB`;

  const getStatusBadge = (status: UploadItem['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="gap-1 shrink-0"><CheckCircle className="w-3 h-3" aria-hidden />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1 shrink-0"><Clock className="w-3 h-3" aria-hidden />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1 shrink-0"><XCircle className="w-3 h-3" aria-hidden />Rejected</Badge>;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this upload?')) {
      setUploads(uploads.filter((u) => u.id !== id));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="px-2.5 py-5 border-b border-[#E6E6E6]">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid grid-cols-3 bg-gray-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              All ({uploads.length})
            </TabsTrigger>
            <TabsTrigger value="papers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Papers ({uploads.filter(u => u.type === 'paper').length})
            </TabsTrigger>
            <TabsTrigger value="presentations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">
              Presentations ({uploads.filter(u => u.type === 'presentation').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-130 divide-y divide-[#E6E6E6]">
            {filteredUploads.map((upload) => (
              <div key={upload.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${upload.type === 'paper' ? 'bg-[#716f49]/10 text-[#716f49]' : 'bg-[#FFB200]/10 text-[#FFB200]'
                    }`}>
                    {upload.type === 'paper'
                      ? <FileText className="w-4 h-4" aria-hidden />
                      : <Presentation className="w-4 h-4" aria-hidden />}
                  </div>

                  {/* Title + meta + actions row */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{upload.title}</p>
                      {getStatusBadge(upload.status)}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{upload.category}</span>
                        <span>·</span>
                        <span>{formatDate(upload.date)}</span>
                        <span>·</span>
                        <span>{formatFileSize(upload.fileSize)}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => window.open(upload.fileUrl, '_blank')}>
                          <Eye className="w-3.5 h-3.5" aria-hidden />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => window.open(upload.fileUrl, '_blank')}>
                          <Download className="w-3.5 h-3.5" aria-hidden />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => handleDelete(upload.id)}>
                          <Trash2 className="w-3.5 h-3.5" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredUploads.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" aria-hidden />
                <p className="text-sm">No uploads found</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
}