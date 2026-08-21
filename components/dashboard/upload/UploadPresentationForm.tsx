"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Presentation, Upload, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const presentationTypes = [
  'Conference Talk', 'Workshop', 'Seminar', 'Poster Session',
  'Demo Session', 'Tutorial', 'Keynote', 'Panel Discussion', 'Other'
];

export default function UploadPresentationForm() {
  const [title, setTitle] = useState('');
  const [event, setEvent] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (allowedTypes.includes(uploadedFile.type)) {
      setFile(uploadedFile);
      setErrorMessage('');
    } else {
      setErrorMessage('Only PDF, PPT, or PPTX files are allowed');
      setFile(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Presentation file is required');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('event', event);
      formData.append('date', date);
      formData.append('type', type);
      formData.append('description', description);

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/presentations/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      setUploadStatus('success');
      setTitle(''); setEvent(''); setDate(''); setType(''); setDescription(''); setFile(null);
    } catch {
      setUploadStatus('error');
      setErrorMessage('Failed to upload presentation. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]">
          <Presentation className="w-6 h-6 text-[#FFB200]" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Upload Presentation</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="pres-title" className="text-sm font-medium text-gray-700">Presentation Title *</Label>
            <Input
              id="pres-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter presentation title"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="pres-type" className="text-sm font-medium text-gray-700">Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v || "")}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {presentationTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="pres-event" className="text-sm font-medium text-gray-700">Event / Conference</Label>
            <Input
              id="pres-event"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="e.g., NeurIPS 2024, CVPR Workshop"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pres-date" className="text-sm font-medium text-gray-700">Date</Label>
            <Input
              id="pres-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="pres-desc" className="text-sm font-medium text-gray-700">Description</Label>
          <textarea
            id="pres-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the presentation"
            rows={3}
            className="mt-1 w-full px-3 py-2 border border-[#E6E6E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB200] focus:border-transparent text-sm"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Presentation File *</Label>
          <div
            {...getRootProps()}
            className={`mt-1 relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragActive
                ? 'border-[#FFB200] bg-[#FFB200]/10'
                : 'border-[#E6E6E6] hover:border-[#FFB200]'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3 text-[#FFB200]">
                <CheckCircle className="w-6 h-6" aria-hidden />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <FileText className="w-10 h-10 mx-auto text-gray-400" aria-hidden />
                <p className="text-gray-600">Drag & drop PDF/PPT/PPTX here, or click to browse</p>
                <p className="text-xs text-gray-400">Max 50MB</p>
              </div>
            )}
          </div>
          {errorMessage && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" aria-hidden />
              {errorMessage}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isUploading}
          className="w-full md:w-auto bg-[#FFB200] hover:bg-[#e6a000] text-white"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
              Uploading...
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" aria-hidden />
              Uploaded Successfully
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" aria-hidden />
              Upload Presentation
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}