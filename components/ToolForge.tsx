
import React, { useState } from 'react';
import { ToolDefinition, TrainingConfig, TrainingPair } from '../types';
import { generateToolLessons } from '../services/geminiService';

interface ToolForgeProps {
  config: TrainingConfig;
  setConfig: React.Dispatch<React.SetStateAction<TrainingConfig>>;
  setDataset: React.Dispatch<React.SetStateAction<TrainingPair[]>>;
}

const ToolForge: React.FC<ToolForgeProps> = ({ config, setConfig, setDataset }) => {
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const addTool = () => {
    const newTool: ToolDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'new_tool',
      description: 'Describe what this tool does...',
      parameters: '{"type": "object", "properties": {}}'
    };
    setConfig(prev => ({ ...prev, tools: [...prev.tools, newTool] }));
    setActiveTool(newTool);
  };

  const updateTool = (updated: ToolDefinition) => {
    setConfig(prev => ({
      ...prev,
      tools: prev.tools.map(t => t.id === updated.id ? updated : t)
    }));
    setActiveTool(updated);
  };

  const generateLessonsForTool = async () => {
    if (!activeTool) return;
    setIsGenerating(true);
    try {
      const lessons = await generateToolLessons(activeTool, 5);
      setDataset(prev => [...prev, ...lessons]);
      alert(`Generated 5 tool-use lessons for ${activeTool.name}! Check the Teaching Lab.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white">Tool Forge</h2>
        <p className="text-gray-400">Teach your model "The Hand"—the ability to call functions and APIs.</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-8 overflow-hidden">
        {/* Tool List */}
        <div className="col-span-1 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Active Abilities</h3>
            <button onClick={addTool} className="text-emerald-400 hover:text-white transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {config.tools.length === 0 ? (
              <p className="text-xs text-gray-600 italic py-10 text-center">No tools defined yet.</p>
            ) : (
              config.tools.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTool(t)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    activeTool?.id === t.id 
                      ? 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400' 
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="font-mono text-sm font-bold truncate">{t.name}</div>
                  <div className="text-[10px] opacity-60 truncate">{t.description}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="col-span-2 flex flex-col space-y-6 overflow-hidden">
          {activeTool ? (
            <div className="flex-1 bg-gray-950 border border-gray-800 rounded-3xl p-8 flex flex-col space-y-6 animate-in slide-in-from-right duration-300">
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tool Handle (ID)</label>
                       <input 
                        type="text" 
                        value={activeTool.name}
                        onChange={(e) => updateTool({...activeTool, name: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white font-mono"
                       />
                    </div>
                    <div className="flex items-end">
                       <button 
                        onClick={generateLessonsForTool}
                        disabled={isGenerating}
                        className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                       >
                         {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                         <span>Forge Training Lessons</span>
                       </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description (Context)</label>
                     <textarea 
                      value={activeTool.description}
                      onChange={(e) => updateTool({...activeTool, description: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white h-24"
                     />
                  </div>

                  <div className="flex-1 space-y-1">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">JSON Schema (Parameters)</label>
                     <textarea 
                      value={activeTool.parameters}
                      onChange={(e) => updateTool({...activeTool, parameters: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-emerald-400 font-mono text-xs flex-1 min-h-[200px]"
                     />
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-700 opacity-50 space-y-4">
               <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
               <p className="text-sm font-bold uppercase tracking-[0.2em]">Select an ability to modify</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ToolForge;
