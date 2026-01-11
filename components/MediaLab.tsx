
import React, { useState } from 'react';
import { generateSyntheticAudio, generateSyntheticVideo } from '../services/geminiService';
import { TrainingPair } from '../types';

interface MediaLabProps {
  setDataset: React.Dispatch<React.SetStateAction<TrainingPair[]>>;
}

const MediaLab: React.FC<MediaLabProps> = ({ setDataset }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('video');
  const [previews, setPreviews] = useState<{ type: string; url: string; prompt: string }[]>([]);

  const handleForgeMedia = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      let url = '';
      if (mediaType === 'audio') {
        url = await generateSyntheticAudio(prompt);
      } else {
        url = await generateSyntheticVideo(prompt);
      }
      
      const newMedia = { type: mediaType, url, prompt };
      setPreviews([newMedia, ...previews]);
      setPrompt('');
    } catch (e) {
      alert("Media synthesis failed. Check your connection to the forge.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addToDataset = (item: { type: string; url: string; prompt: string }) => {
    setDataset(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      instruction: `Generate a ${item.type} based on: ${item.prompt}`,
      response: `[Generated ${item.type} stream]`,
      [item.type]: item.url
    }]);
    alert("Asset added to Teaching Lab curriculum!");
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Forge</h2>
          <p className="text-gray-400">Synthesize high-fidelity video and audio assets for multimodal training.</p>
        </div>
        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button 
            onClick={() => setMediaType('video')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${mediaType === 'video' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}
          >
            🎬 Video (Veo)
          </button>
          <button 
            onClick={() => setMediaType('audio')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${mediaType === 'audio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500'}`}
          >
            🎙️ Audio (TTS)
          </button>
        </div>
      </div>

      <div className="bg-indigo-600/5 border border-indigo-600/20 rounded-[2.5rem] p-10 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <label className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Synthesis Prompt</label>
          <div className="flex space-x-4">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mediaType === 'video' ? "A cinematic shot of a neon cyberpunk city in the rain..." : "Say with a deep, authoritative tone: Welcome to the future of AI training."}
              className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
            />
            <button 
              onClick={handleForgeMedia}
              disabled={isGenerating || !prompt}
              className={`px-10 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                isGenerating ? 'bg-gray-800 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/40'
              }`}
            >
              {isGenerating ? 'Forging...' : 'Ignite'}
            </button>
          </div>
        </div>

        {isGenerating && (
          <div className="flex flex-col items-center py-10 space-y-4 animate-pulse">
             <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
             </div>
             <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Synthesizing Temporal Reality...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
          {previews.map((item, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col group hover:border-indigo-500/50 transition-all shadow-xl">
               <div className="aspect-video bg-black relative">
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <audio src={item.url} controls className="w-[80%]" />
                       <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center pointer-events-none">
                          <svg className="w-12 h-12 text-indigo-400 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                       </div>
                    </div>
                  )}
               </div>
               <div className="p-4 flex flex-col space-y-3">
                  <p className="text-[10px] text-gray-500 line-clamp-2 italic font-medium leading-relaxed">"{item.prompt}"</p>
                  <button 
                    onClick={() => addToDataset(item)}
                    className="w-full py-2 bg-gray-800 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    Add to Curriculum
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MediaLab;
