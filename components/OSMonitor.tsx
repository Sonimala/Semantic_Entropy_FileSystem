
import React from 'react';
import { OSLog, OSActionType } from '../types';

interface Props {
  logs: OSLog[];
}

const OSMonitor: React.FC<Props> = ({ logs }) => {
  const getActionIcon = (action: OSActionType) => {
    switch (action) {
      case OSActionType.CREATE: return 'fa-circle-plus text-emerald-500';
      case OSActionType.MODIFY: return 'fa-arrows-rotate text-blue-500';
      case OSActionType.RENAME: return 'fa-pen-to-square text-amber-500';
      case OSActionType.DELETE: return 'fa-trash-can text-red-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-30">
            <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-300">
              <i className="fas fa-terminal text-3xl"></i>
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
              Monitoring system entropy...<br/>Waiting for file operations.
            </p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="bg-slate-50/50 p-5 rounded-[20px] border border-slate-100 text-[11px] hover:bg-slate-50 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 font-black uppercase tracking-[0.15em] text-slate-900">
                  <i className={`fas ${getActionIcon(log.action)}`}></i>
                  {log.action}
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="font-black text-slate-900 truncate mb-1.5" title={log.fileName}>
                {log.fileName}
              </div>
              <div className="text-slate-500 leading-relaxed font-semibold">
                {log.details}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OSMonitor;
