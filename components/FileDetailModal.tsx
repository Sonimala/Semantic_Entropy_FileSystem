
import React, { useState, useEffect } from 'react';
import { FileNode } from '../types';
import { generateDetailedContent } from '../services/geminiService';

interface Props {
  file: FileNode | null;
  onClose: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onSaveContent: (content: string) => void;
  isUpdating: boolean;
}

const FileDetailModal: React.FC<Props> = ({ file, onClose, onDelete, onRename, onSaveContent, isUpdating }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    if (file) {
      setEditedContent(file.content);
      setIsEditing(false);
      setIsExpanding(false);
    }
  }, [file]);

  if (!file) return null;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete "${file.name}"?`)) {
      onDelete();
      onClose();
    }
  };

  const handleRename = () => {
    const newName = window.prompt(`Rename "${file.name}" to:`, file.name);
    if (newName && newName !== file.name) {
      onRename(newName);
    }
  };

  const handleAIExpand = async () => {
    if (!file) return;
    setIsExpanding(true);
    try {
      const longContent = await generateDetailedContent(file.name, file.content);
      setEditedContent(longContent);
      onSaveContent(longContent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[500px] bg-white border-l border-slate-200 shadow-2xl z-[50] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Detail Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <i className="far fa-file-alt text-lg"></i>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-slate-800 tracking-tight truncate max-w-[200px]">{file.name}</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{file.category}</span>
          </div>
          <button 
            onClick={handleRename}
            className="text-slate-300 hover:text-blue-500 p-1.5 transition-colors rounded-lg hover:bg-blue-50"
            title="Rename File"
          >
            <i className="fas fa-pen text-[10px]"></i>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleDelete} 
            className="text-slate-300 hover:text-red-500 p-2.5 transition-colors rounded-xl hover:bg-red-50"
            title="Delete File"
          >
            <i className="fas fa-trash-alt text-sm"></i>
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2.5 transition-colors rounded-xl hover:bg-slate-50">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">
        {/* Metadata Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Modified</div>
             <div className="text-[11px] font-bold text-slate-700">{new Date(file.lastModified).toLocaleDateString()}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">File Size</div>
             <div className="text-[11px] font-bold text-slate-700">{(file.size / 1024).toFixed(2)} KB</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semantic Keywords</div>
          <div className="flex flex-wrap gap-2">
            {file.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-white text-slate-600 rounded-lg text-[11px] font-bold border border-slate-200">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Content</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleAIExpand}
                disabled={isExpanding || isUpdating}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
              >
                {isExpanding ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-sparkles"></i>}
                Expand to 500 Words
              </button>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
              >
                {isEditing ? 'Cancel' : 'Manual Edit'}
              </button>
            </div>
          </div>
          
          <div className="relative">
            {isEditing ? (
              <div className="space-y-4">
                <textarea 
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-[500px] bg-slate-50 border border-blue-200 rounded-xl p-6 font-mono text-xs text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
                <button 
                  onClick={() => { onSaveContent(editedContent); setIsEditing(false); }}
                  disabled={isUpdating}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                >
                  {isUpdating ? <i className="fas fa-sync fa-spin mr-2"></i> : null}
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="bg-slate-50/50 p-8 rounded-[32px] text-sm text-slate-700 leading-[1.8] whitespace-pre-wrap font-serif border border-slate-100 shadow-inner">
                {isExpanding ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">AI is writing 500 words...</p>
                  </div>
                ) : (
                  file.content
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer status bar */}
      {(isUpdating || isExpanding) && (
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Operation</span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{isExpanding ? 'AI Generating...' : 'Categorizing...'}</span>
          </div>
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-[progress_2s_infinite]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDetailModal;
