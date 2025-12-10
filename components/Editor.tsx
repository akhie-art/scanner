import React, { useState, useEffect } from 'react';
import { ScannedDoc, FilterType } from '../types';
import { applyFilter } from '../utils/imageUtils';
import { extractTextFromImage } from '../services/geminiService';
import { Button } from './Button';
import { 
  ArrowLeft, 
  Check, 
  Wand2, 
  ScanText, 
  Copy, 
  Share2, 
  Download,
  Loader2
} from 'lucide-react';

interface EditorProps {
  doc: ScannedDoc;
  onSave: (updatedDoc: ScannedDoc) => void;
  onBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({ doc, onSave, onBack }) => {
  const [currentFilter, setCurrentFilter] = useState<FilterType>(doc.filter);
  const [previewImage, setPreviewImage] = useState<string>(doc.processedImage);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [extractedText, setExtractedText] = useState<string>(doc.extractedText || '');
  const [isExtracting, setIsExtracting] = useState(false);

  // Apply filter when selection changes
  useEffect(() => {
    const updatePreview = async () => {
      setIsProcessing(true);
      try {
        const result = await applyFilter(doc.originalImage, currentFilter);
        setPreviewImage(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };
    updatePreview();
  }, [currentFilter, doc.originalImage]);

  const handleSave = () => {
    onSave({
      ...doc,
      filter: currentFilter,
      processedImage: previewImage,
      extractedText: extractedText
    });
  };

  const handleExtractText = async () => {
    setActiveTab('text');
    if (extractedText) return; // Already extracted

    setIsExtracting(true);
    try {
      const text = await extractTextFromImage(doc.processedImage); // Use processed image for better OCR
      setExtractedText(text);
      // Auto-save the text
      onSave({
        ...doc,
        filter: currentFilter,
        processedImage: previewImage,
        extractedText: text
      });
    } catch (error) {
      alert("Failed to extract text. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    alert("Text copied to clipboard!");
  };

  const filters = [
    { type: FilterType.ORIGINAL, label: 'Original' },
    { type: FilterType.LIGHTEN, label: 'Lighten' },
    { type: FilterType.MAGIC, label: 'Magic' },
    { type: FilterType.GRAYSCALE, label: 'Gray' },
    { type: FilterType.BW, label: 'B&W' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900 shadow-md z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h2 className="font-medium text-lg">{doc.title}</h2>
        <button 
          onClick={handleSave} 
          className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white"
        >
          <Check size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'image' ? (
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-800 overflow-auto">
            {isProcessing ? (
              <Loader2 className="animate-spin text-emerald-500" size={48} />
            ) : (
              <img 
                src={previewImage} 
                alt="Document Preview" 
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            )}
          </div>
        ) : (
          <div className="flex-1 p-6 bg-white text-slate-900 overflow-y-auto w-full max-w-2xl mx-auto my-4 rounded-lg shadow-lg">
             {isExtracting ? (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                 <Loader2 className="animate-spin text-emerald-600" size={48} />
                 <p className="text-gray-500 animate-pulse">Analyzing document with Gemini AI...</p>
               </div>
             ) : (
               <div className="prose prose-sm w-full max-w-none">
                  {extractedText ? (
                    <div className="whitespace-pre-wrap">{extractedText}</div>
                  ) : (
                    <p className="text-center text-gray-500 mt-10">
                      No text found. Try adjusting the image filter to B&W or Magic.
                    </p>
                  )}
               </div>
             )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-slate-900 border-t border-slate-800 pb-safe">
        
        {/* Tab Switcher (Overlay on top of controls) */}
        <div className="flex justify-center -mt-6 mb-2">
            <div className="bg-slate-800 rounded-full p-1 flex shadow-lg">
                <button 
                  onClick={() => setActiveTab('image')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'image' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Image
                </button>
                <button 
                  onClick={handleExtractText}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'text' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <ScanText size={14} />
                    OCR
                </button>
            </div>
        </div>

        {activeTab === 'image' ? (
          // Filters
          <div className="flex items-center gap-4 overflow-x-auto p-4 no-scrollbar">
            {filters.map((f) => (
              <button
                key={f.type}
                onClick={() => setCurrentFilter(f.type)}
                className={`flex flex-col items-center gap-2 min-w-[60px] group`}
              >
                <div className={`w-14 h-14 rounded-full border-2 overflow-hidden ${currentFilter === f.type ? 'border-emerald-500' : 'border-transparent group-hover:border-slate-600'}`}>
                  {/* Miniature preview (static for performance) */}
                   <div 
                      className={`w-full h-full bg-gray-300 ${f.type === FilterType.BW ? 'grayscale contrast-125' : f.type === FilterType.MAGIC ? 'saturate-150' : ''}`}
                      style={{ 
                        backgroundImage: `url(${doc.originalImage})`, 
                        backgroundSize: 'cover', 
                        filter: f.type === FilterType.BW ? 'grayscale(100%) contrast(200%)' : f.type === FilterType.GRAYSCALE ? 'grayscale(100%)' : f.type === FilterType.MAGIC ? 'saturate(150%) contrast(110%)' : f.type === FilterType.LIGHTEN ? 'brightness(120%)' : 'none'
                      }}
                   />
                </div>
                <span className={`text-xs ${currentFilter === f.type ? 'text-emerald-500 font-medium' : 'text-gray-400'}`}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // Text Actions
          <div className="flex items-center justify-around p-4">
             <Button variant="secondary" onClick={handleCopyText} disabled={!extractedText} className="flex-1 mx-2">
                <Copy size={18} className="mr-2" /> Copy
             </Button>
             <Button variant="secondary" onClick={() => {}} disabled={!extractedText} className="flex-1 mx-2">
                <Share2 size={18} className="mr-2" /> Share
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};