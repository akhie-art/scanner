import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, Search, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { ScannedDoc, AppView, FilterType } from './types';
import { generateId } from './utils/imageUtils';
import { DocList } from './components/DocList';
import { Editor } from './components/Editor';

const STORAGE_KEY = 'webscanner_docs_v1';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.LIST);
  const [docs, setDocs] = useState<ScannedDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<ScannedDoc | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load docs from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDocs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse stored docs");
      }
    }
  }, []);

  // Save docs to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }, [docs]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newDoc: ScannedDoc = {
        id: generateId(),
        title: `Scan ${new Date().toLocaleString()}`,
        originalImage: result,
        processedImage: result,
        createdAt: Date.now(),
        filter: FilterType.ORIGINAL
      };
      
      setDocs(prev => [newDoc, ...prev]);
      setActiveDoc(newDoc);
      setView(AppView.EDITOR);
    };
    reader.readAsDataURL(file);
    // Reset input
    event.target.value = '';
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleSaveDoc = (updatedDoc: ScannedDoc) => {
    setDocs(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    setView(AppView.LIST);
    setActiveDoc(null);
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (view === AppView.EDITOR && activeDoc) {
    return (
      <Editor 
        doc={activeDoc} 
        onSave={handleSaveDoc} 
        onBack={() => {
            setView(AppView.LIST);
            setActiveDoc(null);
        }} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
                <Camera size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">WebScanner</h1>
        </div>
        <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Search size={22} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <MoreVertical size={22} />
            </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full">
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Scans</h2>
            <span className="text-xs text-gray-400">{docs.length} documents</span>
        </div>
        
        <DocList 
          docs={docs} 
          onSelect={(doc) => {
            setActiveDoc(doc);
            setView(AppView.EDITOR);
          }}
          onDelete={handleDelete}
        />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect}
        />
        
        <button 
            onClick={triggerCamera}
            className="h-16 w-16 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white hover:bg-emerald-700 hover:scale-105 transition-all active:scale-95 border-4 border-white"
        >
            <Camera size={32} />
        </button>

         {/* Helper button for gallery upload explicitly if needed by some desktop browsers */}
         <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-20 h-10 w-10 bg-white rounded-full shadow-md text-gray-600 flex items-center justify-center hover:bg-gray-50"
            title="Upload from Gallery"
        >
            <ImageIcon size={20} />
        </button>
      </div>
    </div>
  );
}