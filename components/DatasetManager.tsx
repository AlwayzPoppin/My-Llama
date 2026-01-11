
import React, { useState, useRef } from 'react';
import { TrainingPair, TrainingConfig } from '../types';
import { generateSyntheticData, verifyDataset } from '../services/geminiService';

interface DatasetManagerProps {
  dataset: TrainingPair[];
  setDataset: React.Dispatch<React.SetStateAction<TrainingPair[]>>;
  config: TrainingConfig;
}

const DatasetManager: React.FC<DatasetManagerProps> = ({ dataset, setDataset, config }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [topic, setTopic] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [openThoughts, setOpenThoughts] = useState<Record<string, boolean>>({});
  const [verifications, setVerifications] = useState<Record<string, { status: 'pass' | 'fail', suggestion?: string }>>({});

  const [newPair, setNewPair] = useState<{ instruction: string, response: string, thought?: string, image?: string }>({
    instruction: '',
    response: '',
    thought: '',
    image: undefined
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleThought = (id: string) => {
    setOpenThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const data = await generateSyntheticData(topic, 5, config.reasoningMode);
      setDataset(prev => [...prev, ...data]);
      setTopic('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyAll = async () => {
    if (dataset.length === 0) return;
    setIsVerifying(true);
    try {
      const results = await verifyDataset(dataset);
      const resMap: Record<string, any> = {};
      results.forEach(r => {
        resMap[r.id] = { status: r.status, suggestion: r.suggestion };
      });
      setVerifications(resMap);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPair(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddManually = () => {
    if (!newPair.instruction || !newPair.response) return;
    setDataset(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), ...newPair }
    ]);
    setNewPair({ instruction: '', response: '', thought: '', image: undefined });
    setShowAddForm(false);
  };

  const deletePair = (id: string) => {
    setDataset(prev => prev.filter(p => p.id !== id));
  };

  const handleExportDataset = () => {
    if (dataset.length === 0) return;
    const dataStr = JSON.stringify(dataset, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'my-llama-curriculum.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Teaching Lab</h2>
          <p className="text-gray-400">Manage the core knowledge base of your AI model.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleVerifyAll}
            disabled={isVerifying || dataset.length === 0}
            className={`px-4 py-2 rounded-lg transition-all border font-bold text-xs flex items-center space-x-2 ${isVerifying ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white'
              }`}
          >
            {isVerifying ? <div className="animate-spin w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            <span>{isVerifying ? 'Verifying...' : 'AI Dataset Audit'}</span>
          </button>
          <button
            onClick={handleExportDataset}
            disabled={dataset.length === 0}
            className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all font-bold text-xs flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Export Curriculum</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 font-bold text-xs"
          >
            Add Lesson
          </button>
        </div>
      </div>

      <div className="bg-indigo-600/5 border border-indigo-600/20 rounded-2xl p-6 flex items-end space-x-4 shadow-[0_0_30px_rgba(79,70,229,0.05)]">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-black text-indigo-400 uppercase tracking-widest">Auto-Generate Lessons</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={config.visionEnabled ? "e.g. Visual analysis of C++ memory leaks" : "e.g. Advanced TypeScript design patterns"}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic}
          className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 ${isGenerating
              ? 'bg-gray-700 cursor-not-allowed text-gray-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
            }`}
        >
          {isGenerating ? <span>Forging...</span> : <span>Create 5 Lessons</span>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 rounded-2xl p-6 space-y-4 border border-gray-700 shadow-xl animate-in fade-in zoom-in duration-200">
          <h3 className="text-lg font-bold text-white">Add a New Lesson</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Question</label>
                <textarea
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white text-xs focus:outline-none focus:border-indigo-500"
                  rows={2}
                  value={newPair.instruction}
                  onChange={(e) => setNewPair({ ...newPair, instruction: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Reasoning (Thought Process)</label>
                <textarea
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-gray-400 text-[10px] focus:outline-none focus:border-indigo-500"
                  rows={2}
                  placeholder="Explain the logic before the answer..."
                  value={newPair.thought}
                  onChange={(e) => setNewPair({ ...newPair, thought: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Final Answer</label>
                <textarea
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mt-1 text-white text-xs focus:outline-none focus:border-indigo-500"
                  rows={2}
                  value={newPair.response}
                  onChange={(e) => setNewPair({ ...newPair, response: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Visual Context</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-video rounded-xl border-2 border-dashed border-gray-700 bg-gray-950 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-all overflow-hidden ${newPair.image ? 'border-none' : ''}`}
              >
                {newPair.image ? (
                  <img src={newPair.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-gray-600 uppercase font-black">Upload Image</span>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-xs font-bold">Cancel</button>
            <button onClick={handleAddManually} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all font-bold text-xs">Save Lesson</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-4">
          {dataset.map((pair) => (
            <div key={pair.id} className={`bg-gray-900/40 border rounded-2xl p-5 hover:border-gray-600 transition-all group relative ${verifications[pair.id]?.status === 'fail' ? 'border-red-900/50 bg-red-950/5' : 'border-gray-800'}`}>
              <button
                onClick={() => deletePair(pair.id)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>

              <div className="flex space-x-6">
                {pair.image && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-700 bg-black">
                    <img src={pair.image} alt="Visual Task" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-2">
                    {verifications[pair.id] && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${verifications[pair.id].status === 'pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        Audit: {verifications[pair.id].status}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Instruction</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-medium">{pair.instruction}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Response</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">{pair.response}</p>
                    </div>
                  </div>

                  {verifications[pair.id]?.suggestion && (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                      <p className="text-[10px] text-amber-500 font-bold uppercase mb-1">Expert Suggestion</p>
                      <p className="text-[10px] text-gray-400 italic">"{verifications[pair.id].suggestion}"</p>
                    </div>
                  )}

                  {pair.thought && (
                    <div className="border-t border-gray-800 pt-3">
                      <button
                        onClick={() => toggleThought(pair.id)}
                        className="flex items-center space-x-2 text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-indigo-400"
                      >
                        <svg className={`w-3 h-3 transition-transform ${openThoughts[pair.id] ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
                        <span>Chain-of-Thought Reasoning</span>
                      </button>
                      {openThoughts[pair.id] && (
                        <div className="mt-2 p-3 bg-gray-950 rounded-xl border border-gray-800 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-[10px] text-gray-400 leading-relaxed italic whitespace-pre-wrap">{pair.thought}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatasetManager;
