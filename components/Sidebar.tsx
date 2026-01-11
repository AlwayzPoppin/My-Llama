
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDocumentation?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenDocumentation }) => {
  const tabs = [
    { id: 'autoforge', label: 'Auto-Forge', icon: 'M13 10V3L4 14h7v7l9-11h-7z', special: true, desc: 'AI Architect' },
    { id: 'dataset', label: 'Teaching Lab', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', desc: 'SFT Curation' },
    { id: 'medialab', label: 'Media Lab', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', desc: 'Asset Synthesis' },
    { id: 'alignment', label: 'Alignment Lab', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'RLAIF Tuning' },
    { id: 'toolforge', label: 'Tool Forge', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z', desc: 'Function Calls' },
    { id: 'config', label: 'Brain Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', desc: 'Hyperparameters' },
    { id: 'training', label: 'Training Room', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', desc: 'Neural Tempering' },
    { id: 'testbench', label: 'Test Bench', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', desc: 'Logic Validation' },
    { id: 'export', label: 'Finish & Use', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', desc: 'Deploy GGUF' },
  ];

  return (
    <div className="w-80 bg-gray-950 border-r border-white/5 flex flex-col h-full z-40 relative">
      <div className="p-8 flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.285a2 2 0 01-1.963 0l-.628-.285a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-.34.34a2 2 0 000 2.828l1.245 1.245a2 2 0 002.828 0l.34-.34a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.285-.628a2 2 0 010-1.963l.285-.628a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022l-.34-.34a2 2 0 00-2.828 0L3.34 4.54a2 2 0 000 2.828l.34.34a2 2 0 001.022.547l2.387.477a6 6 0 003.86-.517l.628-.285a2 2 0 011.963 0l.628.285a6 6 0 003.86.517l2.387-.477a2 2 0 001.022-.547l.34-.34a2 2 0 000-2.828l-1.245-1.245a2 2 0 00-2.828 0l-.34.34z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-white leading-none">My Llama</span>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Neural Cast System</span>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full group flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 relative ${activeTab === tab.id
                ? 'bg-white/5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              }`}
          >
            {activeTab === tab.id && (
              <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full" />
            )}
            <div className={`shrink-0 transition-colors ${activeTab === tab.id ? 'text-indigo-400' : 'group-hover:text-gray-300'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              <span className="text-[9px] font-medium text-gray-600 group-hover:text-gray-500 uppercase">{tab.desc}</span>
            </div>
            {tab.special && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={onOpenDocumentation}
          className="w-full flex items-center space-x-3 px-4 py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 transition-all group"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-widest">Forge Academy</span>
            <span className="text-[9px] text-indigo-400/60 uppercase">Documentation</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
