import React, { useState, useEffect } from 'react';
import { TrainingConfig, OLLAMA_MODELS, VISION_ENCODERS, ToolDefinition } from '../types';
import { fetchInstalledModels, checkOllamaStatus } from '../services/ollamaService';

interface ConfigPanelProps {
  config: TrainingConfig;
  setConfig: React.Dispatch<React.SetStateAction<TrainingConfig>>;
  availableModels: string[];
  ollamaConnected: boolean;
  onRefreshModels: () => void;
  isRefreshing: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, availableModels, ollamaConnected, onRefreshModels, isRefreshing }) => {
  const [toolName, setToolName] = useState('');
  const [toolDesc, setToolDesc] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (isNaN(parseFloat(value)) ? value : parseFloat(value));

    setConfig(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const addTool = () => {
    if (!toolName || !toolDesc) return;
    // Fix: Add missing 'id' property to ToolDefinition
    const newTool: ToolDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      name: toolName,
      description: toolDesc,
      parameters: '{}'
    };
    setConfig(prev => ({ ...prev, tools: [...prev.tools, newTool] }));
    setToolName('');
    setToolDesc('');
  };

  return (
    <div className="h-full space-y-8 overflow-y-auto pr-4 custom-scrollbar">
      <div>
        <h2 className="text-2xl font-bold text-white">Brain Settings</h2>
        <p className="text-gray-400">Decide which model you want to start with and how it should study.</p>
      </div>

      <div className="bg-gray-900 border border-indigo-500/20 rounded-3xl p-6 space-y-4">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Neural Connectivity</h3>
        <div className="flex items-center space-x-4">
          <input
            type="password"
            placeholder="Gemini API Key..."
            defaultValue={localStorage.getItem('my_llama_api_key') || ''}
            onBlur={(e) => {
              const key = e.target.value;
              if (key) {
                localStorage.setItem('my_llama_api_key', key);
                // Note: In a real app we'd use a context or global state to trigger the service update
                window.location.reload(); // Quick way to re-init with new key for this demo
              }
            }}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white font-mono"
          />
          <button
            onClick={() => {
              localStorage.removeItem('my_llama_api_key');
              window.location.reload();
            }}
            className="px-4 py-3 bg-red-900/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-900 hover:text-white transition-all"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div className="space-y-6">
          {/* Core Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Core Architecture</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-300">Base Neural Net</label>
                <div className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${ollamaConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 flex animate-pulse'}`} />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {ollamaConnected ? 'Ollama Online' : 'Ollama Offline'}
                  </span>
                  <button
                    onClick={onRefreshModels}
                    disabled={isRefreshing}
                    className="p-1 hover:bg-white/5 rounded-md transition-colors text-gray-400"
                    title="Sync Local Models"
                  >
                    <svg className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                </div>
              </div>
              <select
                name="baseModel"
                value={config.baseModel}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                {availableModels.length > 0 ? (
                  availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))
                ) : (
                  OLLAMA_MODELS.map(m => (
                    <option key={m} value={m}>{m} (Preset)</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Training Method</label>
              <select
                name="trainingMethod"
                value={config.trainingMethod}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="SFT">Supervised (Instruction Tuning)</option>
                <option value="DPO">Preference (Alignment Tuning)</option>
                <option value="ORPO">ORPO (Unified Tuning)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 mt-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.visionEnabled ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200">Vision (Multimodal)</p>
                  <p className="text-[10px] text-gray-500">Inject image-processing layers</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="visionEnabled" checked={config.visionEnabled} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Tool / Ability Definition */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Abilities (Tool Call Training)</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tool Name (e.g. search_db)"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white"
              />
              <textarea
                placeholder="Description of what this tool does..."
                value={toolDesc}
                onChange={(e) => setToolDesc(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white h-20"
              />
              <button
                onClick={addTool}
                className="w-full py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
              >
                Inject Tool Definition
              </button>
            </div>

            <div className="space-y-2 pt-4">
              {config.tools.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-xs text-gray-300 font-mono">{t.name}</span>
                  <button onClick={() => setConfig(prev => ({ ...prev, tools: prev.tools.filter((_, idx) => idx !== i) }))} className="text-red-500 hover:text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2">Study Parameters</h3>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 flex justify-between">
                <span>Practice Rounds (Epochs)</span>
                <span className="text-indigo-400 font-mono">{config.epochs}</span>
              </label>
              <input type="range" name="epochs" min="1" max="20" value={config.epochs} onChange={handleChange} className="w-full accent-indigo-600" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Learning Rate (Alpha)</label>
              <input type="number" name="learningRate" step="0.00001" value={config.learningRate} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-mono" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Group Size</label>
                <select name="batchSize" value={config.batchSize} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                  {[1, 4, 8, 16].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Memory Span</label>
                <select name="contextLength" value={config.contextLength} onChange={handleChange} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                  {[1024, 2048, 4096, 8192].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ConfigPanel;
