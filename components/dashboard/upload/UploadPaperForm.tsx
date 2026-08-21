"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const paperCategories = [
  'Machine Learning', 'Computer Vision', 'NLP', 'Graph Neural Networks',
  'Optimization', 'Robotics', 'Reinforcement Learning', 'Other'
];

export default function UploadPaperForm() {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.type === 'application/pdf') {
      setPdfFile(file);
      setErrorMessage('');
    } else {
      setErrorMessage('Only PDF files are allowed');
      setPdfFile(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setErrorMessage('PDF file is required');
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
      formData.append('pdf', pdfFile);
      formData.append('title', title);
      formData.append('authors', authors);
      formData.append('abstract', abstract);
      formData.append('category', category);
      formData.append('tags', tags);

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/papers/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      setUploadStatus('success');
      setTitle(''); setAuthors(''); setAbstract(''); setCategory(''); setTags(''); setPdfFile(null);
    } catch {
      setUploadStatus('error');
      setErrorMessage('Failed to upload paper. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]">
          <FileText className="w-6 h-6 text-[#716f49]" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Upload Research Paper</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Paper Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter paper title"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v || "")}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {paperCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="authors" className="text-sm font-medium text-gray-700">Authors</Label>
          <Input
            id="authors"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="Author names (comma separated)"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="tags" className="text-sm font-medium text-gray-700">Tags</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Keywords (comma separated)"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="abstract" className="text-sm font-medium text-gray-700">Abstract</Label>
          <textarea
            id="abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Enter paper abstract"
            rows={4}
            className="mt-1 w-full px-3 py-2 border border-[#E6E6E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#716f49] focus:border-transparent text-sm"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">PDF File *</Label>
          <div
            {...getRootProps()}
            className={`mt-1 relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragActive
                ? 'border-[#716f49] bg-[#716f49]/5'
                : 'border-[#E6E6E6] hover:border-[#716f49]'
            }`}
          >
            <input {...getInputProps()} />
            {pdfFile ? (
              <div className="flex items-center justify-center gap-3 text-[#716f49]">
                <CheckCircle className="w-6 h-6" aria-hidden />
                <div className="text-left">
                  <p className="font-medium">{pdfFile.name}</p>
                  <p className="text-sm text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 mx-auto text-gray-400" aria-hidden />
                <p className="text-gray-600">Drag & drop PDF here, or click to browse</p>
                <p className="text-xs text-gray-400">PDF only, max 50MB</p>
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
          className="w-full md:w-auto bg-[#716f49] hover:bg-[#5d5b3d] text-white"
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
              Upload Paper
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}