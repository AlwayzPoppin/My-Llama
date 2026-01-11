
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TrainingConfig, TrainingPair, TrainingStatus } from '../types';

interface TestBenchProps {
  config: TrainingConfig;
  dataset: TrainingPair[];
  status: TrainingStatus;
}

const TestBench: React.FC<TestBenchProps> = ({ config, dataset, status }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string; thought?: string; image?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showThought, setShowThought] = useState<Record<number, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input && !selectedImage) return;

    // Create a new GoogleGenAI instance right before making an API call 
    // to ensure it uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const userMsg = { role: 'user' as const, content: input, image: selectedImage || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsThinking(true);

    try {
      const systemInstruction = `You are the local fine-tuned model named 'ForgeAI'. 
      Your base architecture is ${config.baseModel}. 
      You have been trained on a dataset of ${dataset.length} examples.
      Context: ${config.visionEnabled ? 'You have multimodal vision capabilities enabled.' : 'You are text-only.'}
      
      Respond in JSON format with "thought" and "response" keys.
      The "thought" should be your internal reasoning.
      The "response" is the final message to the user.`;

      const contents: any[] = [{ text: input || "Analyze this image." }];
      if (userMsg.image) {
        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: userMsg.image.split(',')[1]
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: { 
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{"thought": "...", "response": "Error processing"}');
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.response, 
        thought: data.thought 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Error: Could not connect to the local inference engine." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (status !== TrainingStatus.COMPLETED && status !== TrainingStatus.PAUSED) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border-4 border-dashed border-gray-800 shadow-[0_0_50px_rgba(255,255,255,0.02)]">
           <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Lab Locked</h2>
        <p className="text-gray-400 max-w-md">You need to complete a training session or pause an active one before you can test the model's performance.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950/40 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl relative">
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-sm tracking-tight text-white uppercase">Live Test Bench: {config.baseModel}</h3>
        </div>
        <span className="text-[10px] font-mono text-gray-500">n_ctx: {config.contextLength} | multimodal: {config.visionEnabled ? 'YES' : 'NO'}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-3 opacity-50">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="text-sm font-bold uppercase tracking-widest">Start a conversation</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {m.thought && (
              <div className="mb-2 max-w-[70%]">
                 <button 
                  onClick={() => setShowThought(prev => ({...prev, [i]: !prev[i]}))}
                  className="flex items-center space-x-2 text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-indigo-400 transition-colors ml-4 mb-1"
                 >
                   <svg className={`w-3 h-3 transition-transform ${showThought[i] ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                   <span>{showThought[i] ? 'Hide' : 'Reveal'} Hidden Monologue</span>
                 </button>
                 {showThought[i] && (
                   <div className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl text-[10px] text-gray-500 italic font-mono mb-2 leading-relaxed">
                     {m.thought}
                   </div>
                 )}
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'}`}>
              {m.image && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/10 max-w-[200px]">
                  <img src={m.image} alt="Input" className="w-full h-auto" />
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2 shadow-inner">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-900/80 backdrop-blur-md border-t border-gray-800 shrink-0">
        <div className="flex items-end space-x-3 bg-gray-950 border border-gray-700 rounded-2xl p-2 focus-within:border-indigo-500 transition-colors">
          {config.visionEnabled && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-xl transition-colors ${selectedImage ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800 text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          
          <div className="flex-1 flex flex-col">
            {selectedImage && (
              <div className="p-2 mb-2 bg-gray-900 rounded-lg flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Image Attached</span>
                <button onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-red-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Test the weights..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-white resize-none max-h-32 py-2 px-1"
            />
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!input && !selectedImage}
            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TestBench;
