import React from 'react';
import { ScannedDoc } from '../types';
import { FileText, Calendar, ChevronRight, Trash2 } from 'lucide-react';

interface DocListProps {
  docs: ScannedDoc[];
  onSelect: (doc: ScannedDoc) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const DocList: React.FC<DocListProps> = ({ docs, onSelect, onDelete }) => {
  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <FileText size={48} className="text-gray-300" />
        </div>
        <p className="text-lg font-medium">No documents yet</p>
        <p className="text-sm">Tap the camera to start scanning</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
      {docs.map((doc) => (
        <div 
          key={doc.id}
          onClick={() => onSelect(doc)}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] transform transition-transform"
        >
          <div className="flex h-24 sm:h-32">
            <div className="w-24 sm:w-32 bg-gray-200 shrink-0">
              <img 
                src={doc.processedImage} 
                alt={doc.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 truncate">{doc.title}</h3>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar size={12} className="mr-1" />
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={(e) => onDelete(e, doc.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};