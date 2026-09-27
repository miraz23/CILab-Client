"use client";

import React, { useState } from 'react';
import { FileText, Presentation, Plus, Trash2, Edit2, Check, Tag, BookOpen, Users, Lightbulb, Cpu, Microscope, Brain, Network } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Category {
  id: string;
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function CategoryRow({
  category,
  isEditing,
  editValue,
  onEditValueChange,
  onEdit,
  onSave,
  onDelete,
}: {
  category: Category;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (val: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const Icon = category.icon;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${category.color}`}>
        <Icon className="w-4 h-4 text-white" aria-hidden />
      </div>
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            className="text-sm h-8"
            autoFocus
          />
          <Button variant="ghost" size="sm" onClick={onSave} className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 shrink-0">
            <Check className="w-4 h-4" aria-hidden />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate text-sm">{category.name}</p>
            <p className="text-xs text-gray-500">{category.count} items</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100">
              <Edit2 className="w-3.5 h-3.5" aria-hidden />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" aria-hidden />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const paperCategories: Category[] = [
  { id: 'p1', name: 'Machine Learning', count: 45, icon: Brain, color: 'bg-[#716f49]' },
  { id: 'p2', name: 'Computer Vision', count: 32, icon: Cpu, color: 'bg-[#4A90E2]' },
  { id: 'p3', name: 'NLP', count: 28, icon: Network, color: 'bg-[#0AA90F]' },
  { id: 'p4', name: 'Graph Neural Networks', count: 15, icon: Users, color: 'bg-[#8E24AA]' },
  { id: 'p5', name: 'Optimization', count: 12, icon: Lightbulb, color: 'bg-[#FF7043]' },
  { id: 'p6', name: 'Robotics', count: 8, icon: Microscope, color: 'bg-[#E63946]' },
  { id: 'p7', name: 'Reinforcement Learning', count: 6, icon: BookOpen, color: 'bg-[#FFB200]' },
  { id: 'p8', name: 'Other', count: 4, icon: Tag, color: 'bg-gray-500' },
];

const presentationCategories: Category[] = [
  { id: 'pr1', name: 'Conference Talk', count: 12, icon: Users, color: 'bg-[#716f49]' },
  { id: 'pr2', name: 'Workshop', count: 8, icon: Lightbulb, color: 'bg-[#4A90E2]' },
  { id: 'pr3', name: 'Seminar', count: 6, icon: BookOpen, color: 'bg-[#0AA90F]' },
  { id: 'pr4', name: 'Poster Session', count: 4, icon: Network, color: 'bg-[#8E24AA]' },
  { id: 'pr5', name: 'Demo Session', count: 3, icon: Cpu, color: 'bg-[#FF7043]' },
  { id: 'pr6', name: 'Tutorial', count: 2, icon: Brain, color: 'bg-[#E63946]' },
  { id: 'pr7', name: 'Keynote', count: 1, icon: Microscope, color: 'bg-[#FFB200]' },
  { id: 'pr8', name: 'Other', count: 2, icon: Tag, color: 'bg-gray-500' },
];

export default function UploadCategories() {
  const [paperCats, setPaperCats] = useState<Category[]>(paperCategories);
  const [presentationCats, setPresentationCats] = useState<Category[]>(presentationCategories);
  const [newPaperCat, setNewPaperCat] = useState('');
  const [newPresentationCat, setNewPresentationCat] = useState('');

  // ✅ Separate editing state per list
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [editingPaperValue, setEditingPaperValue] = useState('');
  const [editingPresentationId, setEditingPresentationId] = useState<string | null>(null);
  const [editingPresentationValue, setEditingPresentationValue] = useState('');

  const handleSaveEdit = (
    editingId: string | null,
    editValue: string,
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
    setEditingId: (id: string | null) => void,
    setEditValue: (val: string) => void,
  ) => {
    if (!editValue.trim() || !editingId) return;
    setCategories((prev) =>
      prev.map((cat) => (cat.id === editingId ? { ...cat, name: editValue.trim() } : cat))
    );
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string, setCategories: React.Dispatch<React.SetStateAction<Category[]>>) => {
    if (confirm('Delete this category?')) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  const handleAddCategory = (
    type: 'paper' | 'presentation',
    name: string,
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  ) => {
    if (!name.trim()) return;
    const prefix = type === 'paper' ? 'p' : 'pr';
    setCategories((prev) => [...prev, {
      id: `${prefix}-${Date.now()}`,
      name: name.trim(),
      count: 0,
      icon: Tag,
      color: 'bg-gray-500',
    }]);
    if (type === 'paper') setNewPaperCat('');
    else setNewPresentationCat('');
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Paper Categories */}
      <Card className="bg-white rounded-2xl shadow-sm">
        <div className="p-5 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#716f49]/10">
                <FileText className="w-6 h-6 text-[#716f49]" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Paper</h2>
            </div>
            <span className="text-sm text-gray-500">{paperCats.length} Categories</span>
          </div>
        </div>
        <CardContent className="p-5 space-y-1">
          {paperCats.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              isEditing={editingPaperId === cat.id}
              editValue={editingPaperValue}
              onEditValueChange={setEditingPaperValue}
              onEdit={() => { setEditingPaperId(cat.id); setEditingPaperValue(cat.name); }}
              onSave={() => handleSaveEdit(editingPaperId, editingPaperValue, setPaperCats, setEditingPaperId, setEditingPaperValue)}
              onDelete={() => handleDelete(cat.id, setPaperCats)}
            />
          ))}
          <div className="flex items-center gap-2 pt-3 mt-2 border-t border-[#F0F0F0]">
            <Input
              value={newPaperCat}
              onChange={(e) => setNewPaperCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory('paper', newPaperCat, setPaperCats)}
              placeholder="Add new category..."
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={() => handleAddCategory('paper', newPaperCat, setPaperCats)} className="h-9 shrink-0">
              <Plus className="w-4 h-4 mr-1" aria-hidden />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Presentation Categories */}
      <Card className="bg-white rounded-2xl shadow-sm">
        <div className="p-5 border-b border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFB200]/10">
                <Presentation className="w-6 h-6 text-[#FFB200]" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Presentation</h2>
            </div>
            <span className="text-sm text-gray-500">{presentationCats.length} Types</span>
          </div>
        </div>
        <CardContent className="p-5 space-y-1">
          {presentationCats.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              isEditing={editingPresentationId === cat.id}
              editValue={editingPresentationValue}
              onEditValueChange={setEditingPresentationValue}
              onEdit={() => { setEditingPresentationId(cat.id); setEditingPresentationValue(cat.name); }}
              onSave={() => handleSaveEdit(editingPresentationId, editingPresentationValue, setPresentationCats, setEditingPresentationId, setEditingPresentationValue)}
              onDelete={() => handleDelete(cat.id, setPresentationCats)}
            />
          ))}
          <div className="flex items-center gap-2 pt-3 mt-2 border-t border-[#F0F0F0]">
            <Input
              value={newPresentationCat}
              onChange={(e) => setNewPresentationCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory('presentation', newPresentationCat, setPresentationCats)}
              placeholder="Add new type..."
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={() => handleAddCategory('presentation', newPresentationCat, setPresentationCats)} className="h-9 shrink-0">
              <Plus className="w-4 h-4 mr-1" aria-hidden />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}