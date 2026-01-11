
import React, { useState } from 'react';
import { getAutoForgePlan } from '../services/geminiService';
import { TrainingConfig, TrainingPair, ForgePlan } from '../types';

interface AutoForgeProps {
  onPlanReady: (config: TrainingConfig, lessons: TrainingPair[]) => void;
  startTraining: () => void;
}

const AutoForge: React.FC<AutoForgeProps> = ({ onPlanReady, startTraining }) => {
  const [mission, setMission] = useState('');
  const [isForging, setIsForging] = useState(false);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<ForgePlan | null>(null);

  const presets = [
    { id: 'voice_acting', label: 'Voice Coach', icon: '🎭', text: 'Train a model to analyze scripts for emotional subtext and provide voice acting direction, including pitch, tempo, and emphasis recommendations for characters.' },
    { id: 'video_editing', label: 'Edit Assistant', icon: '✂️', text: 'Build an AI that analyzes raw video footage to identify best takes, suggests transition points based on pacing, and detects continuity errors.' },
    { id: 'game_qa', label: 'Game QA Agent', icon: '🎮', text: 'Build a vision-capable AI that monitors gameplay frames to detect visual glitches like z-fighting and character clipping.' },
    { id: 'video_gen', label: 'Video Director', icon: '🎬', text: 'Train a model to understand temporal consistency and generate cinematic descriptions for prompt-to-video engines.' }
  ];

  const forgeSteps = ["Analyzing Intent", "Scanning Domain", "Neural Synthesis", "Curriculum Drafting", "Finalizing Protocol"];

  const handleForge = async () => {
    if (!mission) return;
    setIsForging(true);
    setStep(0);
    setPlan(null);

    const stepInterval = setInterval(() => {
      setStep(prev => (prev < forgeSteps.length - 1 ? prev + 1 : prev));
    }, 1000);

    try {
      const generatedPlan = await getAutoForgePlan(mission);
      setPlan(generatedPlan);
      onPlanReady(generatedPlan.config, generatedPlan.lessons);
      setTimeout(() => { clearInterval(stepInterval); setStep(forgeSteps.length); }, 1500);
    } catch (error) {
      alert("Forge failure. Check core systems.");
      setIsForging(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-6xl mx-auto space-y-12">
      {!isForging ? (
        <div className="text-center space-y-10 w-full animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="space-y-4">
            <h1 className="text-7xl font-black text-white tracking-tighter leading-none">
              Auto-Forge <span className="text-indigo-500">Engine</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              Define your AI's purpose. Gemini will architect the weights and curriculum.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => setMission(p.text)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center space-x-3 ${
                  mission === p.text 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/20 scale-105' 
                  : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          <div className="relative group max-w-3xl mx-auto w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="Describe your AI's specialization..."
              className="relative w-full bg-[#030712] border border-white/10 rounded-[2.5rem] px-10 py-10 text-2xl text-white placeholder-gray-800 focus:outline-none focus:border-indigo-500/30 transition-all min-h-[260px] shadow-2xl custom-scrollbar"
            />
          </div>

          <button
            onClick={handleForge}
            disabled={!mission}
            className={`px-16 py-6 rounded-3xl font-black text-xl tracking-[0.2em] uppercase transition-all duration-500 transform active:scale-95 flex items-center space-x-6 mx-auto ${
              mission 
                ? 'bg-white text-black shadow-2xl shadow-white/10 hover:scale-105' 
                : 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5'
            }`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>Ignite Forge</span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-5xl h-[700px] bg-gray-900/20 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 shadow-2xl flex flex-col animate-in zoom-in-95 duration-700 relative overflow-hidden">
          {step < forgeSteps.length ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-12">
              <div className="relative">
                <div className="w-48 h-48 border-[6px] border-white/5 border-t-indigo-500 rounded-full animate-spin duration-[2s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-full animate-pulse flex items-center justify-center">
                     <svg className="w-10 h-10 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-white tracking-tight">{forgeSteps[step]}</h2>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
              
              <div className="w-full max-w-md bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-out"
                  style={{ width: `${(step / forgeSteps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-10 overflow-hidden animate-in fade-in duration-1000">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white leading-none">Casting Complete</h2>
                    <p className="text-gray-500 text-sm mt-2 font-mono">Mission Ref: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                   <button onClick={() => setIsForging(false)} className="px-6 py-3 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">Recast</button>
                   <button onClick={startTraining} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95">Initiate Tempering</button>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-10 overflow-hidden">
                <div className="lg:col-span-2 flex flex-col space-y-8 overflow-y-auto pr-4 custom-scrollbar">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Briefing</h3>
                    <p className="text-sm text-gray-300 leading-relaxed italic opacity-80">"{plan?.missionBriefing}"</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Casting Protocol</h3>
                    <div className="space-y-2">
                      {plan?.protocol.map((step, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <span className="text-[10px] font-mono text-gray-600">{(i+1).toString().padStart(2, '0')}</span>
                          <span className="text-xs text-gray-400 font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-col space-y-4 overflow-hidden">
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Curriculum Manifest ({plan?.lessons.length})</h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {plan?.lessons.map((lesson, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
                        <p className="text-xs font-bold text-gray-300 mb-2">Q: {lesson.instruction}</p>
                        <p className="text-[10px] text-gray-500 font-mono leading-relaxed line-clamp-2">A: {lesson.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AutoForge;
