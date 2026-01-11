
import React from 'react';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpOverlay: React.FC<HelpOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: "🎭 Voice Acting Training",
      content: [
        "**Emotional Labeling:** Use the Media Lab to generate audio with different voices. When adding to curriculum, explicitly label the 'response' with phonemes, stress patterns, and emotional markers (e.g., [Whispered], [Urgently]).",
        "**Subtext Analysis:** Train the model to look at scripts and 'thought' process the subtext before giving direction. This creates a much more intelligent 'Acting Coach'.",
        "**Accent Training:** If your base model supports audio, upload samples of specific regional dialects to help the model learn the nuances of vocal cadence."
      ]
    },
    {
      title: "✂️ Video Editing Training",
      content: [
        "**Pacing & Rhythm:** Train the AI on 'B-Roll' vs 'A-Roll' timing. Use the instruction field to describe a scene's intended mood and the response to suggest specific millisecond durations for cuts.",
        "**Continuity Check:** If using a vision-capable base, upload two consecutive frames and ask the AI to find 'Prop Jumps' or 'Lighting mismatches'.",
        "**Narrative Flow:** Teach the model to identify 'Fat' in a timeline—segments that don't push the story forward. Use the DPO lab to rank 'Tight Edits' over 'Loose Edits'."
      ]
    },
    {
      title: "🚀 Quick Start (No-Code)",
      content: [
        "1. Go to **Auto-Forge** and describe your mission in plain English.",
        "2. Click **Generate Forge Plan** and wait for Gemini to build your dataset.",
        "3. Click **Ignite Local Forge** to start training in the Training Room.",
        "4. Once progress hits 100%, go to the **Test Bench** to try it out!"
      ]
    },
    {
      title: "🧠 The Three Pillars of Training",
      content: [
        "**SFT (Teaching Lab):** This is where your model learns the 'what'. You give it questions and correct answers. Use the 'AI Audit' to let Gemini fix your messy data.",
        "**Alignment (DPO Lab):** This is where the model learns the 'how'. By choosing winners (or letting Gemini auto-rank), you teach the model your preferred style and tone.",
        "**Tools (Tool Forge):** Teach your model to interact with the world. Define a 'search' or 'calculate' tool here, and the model learns to output JSON commands instead of just talking."
      ]
    },
    {
      title: "👁️ Hybrid Vision Secrets",
      content: [
        "To build a Vision model, enable **Hybrid Vision** in Brain Settings.",
        "Upload images in the **Teaching Lab** while creating lessons.",
        "Training a vision model takes longer and requires more VRAM (12GB+ recommended).",
        "Gemini will automatically analyze your images during Auto-Forge to create visual training data."
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-gray-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-800 flex items-center justify-between shrink-0 bg-gray-900/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Forge Academy</h2>
              <p className="text-gray-500 text-sm font-medium">Master the art of local AI training.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center space-x-3">
                <span>{section.title}</span>
                <div className="h-px bg-indigo-500/20 flex-1" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.content.map((item, i) => {
                  const [bold, ...rest] = item.split(':');
                  return (
                    <div key={i} className="p-6 bg-gray-950/50 border border-gray-800 rounded-3xl hover:border-gray-700 transition-colors">
                      {rest.length > 0 ? (
                        <p className="text-sm text-gray-400 leading-relaxed">
                          <strong className="text-indigo-300 uppercase tracking-tighter block mb-1">{bold}</strong>
                          {rest.join(':')}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">{item}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-gray-800 flex flex-col items-center text-center space-y-4 pb-4">
             <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             </div>
             <div>
                <p className="text-white font-bold">You are ready to ignite the forge.</p>
                <p className="text-gray-500 text-xs mt-1">Don't worry about being an expert. Gemini is your co-pilot.</p>
             </div>
             <button 
                onClick={onClose}
                className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-900/40 transition-all"
             >
               Start Forging
             </button>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default HelpOverlay;
