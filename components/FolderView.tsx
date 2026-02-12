
import React, { useState } from 'react';
import { FileNode, SemanticCluster } from '../types';

interface Props {
  files: FileNode[];
  clusters: SemanticCluster[];
  onSelectFile: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
}

const FolderView: React.FC<Props> = ({ files, clusters, onSelectFile, onDeleteFile, onRenameFile }) => {
  const [rootExpanded, setRootExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    clusters.forEach(c => initial[c.name] = true);
    return initial;
  });

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDeleteFile(id);
    }
  };

  const handleRename = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const newName = window.prompt(`Rename "${currentName}" to:`, currentName);
    if (newName && newName !== currentName) {
      onRenameFile(id, newName);
    }
  };

  return (
    <div className="w-full select-none">
      <div className="space-y-1">
        {/* Root Level */}
        <div className="group">
          <div 
            onClick={() => setRootExpanded(!rootExpanded)}
            className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-100/80 rounded-lg px-2 transition-all"
          >
            <i className={`fas fa-chevron-${rootExpanded ? 'down' : 'right'} text-[8px] text-slate-400 transition-transform`}></i>
            <div className="flex items-center gap-1.5">
              <i className="fas fa-hdd text-blue-500 text-sm"></i>
              <i className="fas fa-folder text-amber-400 text-sm"></i>
            </div>
            <span className="font-bold text-slate-900 text-sm">Root</span>
            <span className="ml-auto text-[10px] text-slate-400 font-mono font-bold">{files.length}</span>
          </div>

          {rootExpanded && (
            <div className="ml-4 pl-3 border-l border-slate-200/60 space-y-1 mt-1">
              {clusters.map(cluster => (
                <div key={cluster.name} className="relative">
                  <div 
                    onClick={() => toggleFolder(cluster.name)}
                    className="flex items-center gap-2.5 py-1.5 px-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                  >
                    <i className={`fas fa-chevron-${expandedFolders[cluster.name] ? 'down' : 'right'} text-[8px] text-slate-300`}></i>
                    <i className={`fas ${expandedFolders[cluster.name] ? 'fa-folder-open' : 'fa-folder'} text-sm`} style={{ color: cluster.color }}></i>
                    <span className="text-xs font-semibold text-slate-700 truncate">{cluster.name}</span>
                    <span className="ml-auto text-[10px] text-slate-400 font-mono">{cluster.files.length}</span>
                  </div>

                  {expandedFolders[cluster.name] && (
                    <div className="ml-4 pl-3 border-l border-slate-200/40 space-y-0.5 mt-0.5">
                      {cluster.files.map(fileId => {
                        const file = files.find(f => f.id === fileId);
                        if (!file) return null;
                        return (
                          <div 
                            key={file.id} 
                            onClick={() => onSelectFile(file.id)}
                            className="flex items-center gap-2.5 py-1.5 px-2 hover:bg-blue-50 rounded-lg cursor-pointer text-slate-500 hover:text-blue-600 transition-all group/file"
                          >
                            <i className="far fa-file-alt text-slate-400 group-hover/file:text-blue-400"></i>
                            <span className="text-xs truncate flex-1">{file.name}</span>
                            <div className="flex items-center opacity-0 group-hover/file:opacity-100 transition-all">
                              <button 
                                onClick={(e) => handleRename(e, file.id, file.name)}
                                className="p-1.5 hover:bg-blue-100 hover:text-blue-600 rounded-md transition-all"
                                title="Rename file"
                              >
                                <i className="fas fa-pen text-[10px]"></i>
                              </button>
                              <button 
                                onClick={(e) => handleDelete(e, file.id, file.name)}
                                className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-all"
                                title="Delete file"
                              >
                                <i className="fas fa-trash-alt text-[10px]"></i>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderView;
