
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { PreferencePair, TrainingConfig } from '../types';
import { autoRankPreference } from '../services/geminiService';

interface AlignmentLabProps {
  preferences: PreferencePair[];
  setPreferences: React.Dispatch<React.SetStateAction<PreferencePair[]>>;
  config: TrainingConfig;
}

const AlignmentLab: React.FC<AlignmentLabProps> = ({ preferences, setPreferences, config }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const [currentPair, setCurrentPair] = useState<{ chosen: string, rejected: string } | null>(null);

  const generateOptions = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setCurrentPair(null);

    // Create a new GoogleGenAI instance right before making an API call 
    // to ensure it uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given the prompt: "${prompt}", generate two distinct responses. 
        Response A should be high-quality, professional, and accurate. 
        Response B should be slightly worse—maybe wordy, slightly inaccurate, or poor formatting.
        Return in JSON format with "A" and "B" keys.`,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || '{}');
      setCurrentPair({ chosen: data.A, rejected: data.B });
    } catch (e) {
      alert("Failed to generate options.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoRank = async () => {
    if (!currentPair) return;
    setIsRanking(true);
    try {
      const { winner, critique } = await autoRankPreference(prompt, currentPair.chosen, currentPair.rejected);
      
      const newPair: PreferencePair = {
        id: Math.random().toString(36).substr(2, 9),
        prompt,
        chosen: winner === 'A' ? currentPair.chosen : currentPair.rejected,
        rejected: winner === 'A' ? currentPair.rejected : currentPair.chosen,
        critique
      };

      setPreferences(prev => [newPair, ...prev]);
      setCurrentPair(null);
      setPrompt('');
      alert(`Teacher AI (Gemini) has selected the winner!\n\nCritique: ${critique}`);
    } catch (e) {
      alert("Auto-ranking failed.");
    } finally {
      setIsRanking(false);
    }
  };

  const savePreference = (winner: 'A' | 'B') => {
    if (!currentPair) return;
    
    const newPair: PreferencePair = {
      id: Math.random().toString(36).substr(2, 9),
      prompt,
      chosen: winner === 'A' ? currentPair.chosen : currentPair.rejected,
      rejected: winner === 'A' ? currentPair.rejected : currentPair.chosen,
      critique: 'Manually selected by user'
    };

    setPreferences(prev => [newPair, ...prev]);
    setCurrentPair(null);
    setPrompt('');
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Alignment Lab</h2>
          <p className="text-gray-400">Teach the AI "style" by choosing which answers are better.</p>
        </div>
        {currentPair && (
          <button 
            onClick={handleAutoRank}
            disabled={isRanking}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center space-x-2 animate-pulse"
          >
            {isRanking ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>}
            <span>Gemini Auto-Rank (RLAIF)</span>
          </button>
        )}
      </div>

      <div className="bg-purple-600/5 border border-purple-600/20 rounded-3xl p-8 flex flex-col space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-purple-400 uppercase tracking-widest">Alignment Prompt</label>
          <div className="flex space-x-4">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a React hook for managing a shopping cart..."
              className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              onClick={generateOptions}
              disabled={isGenerating || !prompt}
              className="px-8 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-500 transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Simulating...' : 'Generate Options'}
            </button>
          </div>
        </div>

        {currentPair && !isRanking && (
          <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div 
              onClick={() => savePreference('A')}
              className="bg-gray-900 border-2 border-transparent hover:border-purple-500 rounded-3xl p-6 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Response Option A</span>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">{currentPair.chosen}</p>
            </div>

            <div 
              onClick={() => savePreference('B')}
              className="bg-gray-900 border-2 border-transparent hover:border-purple-500 rounded-3xl p-6 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Response Option B</span>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">{currentPair.rejected}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Alignment History ({preferences.length})</h3>
        {preferences.map(p => (
          <div key={p.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 flex flex-col space-y-4">
             <div className="flex justify-between items-start">
               <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Prompt: {p.prompt}</p>
               {p.critique && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">Auto-Ranked</span>}
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-emerald-500 font-bold uppercase">Chosen (Positive Gradient)</span>
                  <p className="text-xs text-gray-400 line-clamp-3 italic">"{p.chosen}"</p>
                </div>
                <div className="space-y-2 opacity-40">
                  <span className="text-[10px] text-red-500 font-bold uppercase">Rejected (Negative Gradient)</span>
                  <p className="text-xs text-gray-400 line-clamp-3 italic">"{p.rejected}"</p>
                </div>
             </div>
             {p.critique && (
               <div className="p-3 bg-gray-950 rounded-lg border border-gray-800">
                 <p className="text-[10px] text-gray-500 font-mono italic">Critique: {p.critique}</p>
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlignmentLab;
