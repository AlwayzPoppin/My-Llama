
import React, { useState, useEffect } from 'react';
import { TrainingConfig } from '../types';
import { generateModelfile } from '../services/geminiService';

interface ExportPanelProps {
  config: TrainingConfig;
}

type ExportMode = 'ollama' | 'native';

const ExportPanel: React.FC<ExportPanelProps> = ({ config }) => {
  const [modelfile, setModelfile] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<ExportMode>('ollama');

  useEffect(() => {
    const fetchModelfile = async () => {
      setIsGenerating(true);
      try {
        const result = await generateModelfile(config.baseModel, config);
        let finalFile = result;
        if (config.visionEnabled) {
          const visionHeader = `# --- HYBRID VISION ACTIVATED ---\n# This model requires a vision projector (mmproj) for full multimodal capabilities.\n\n`;
          const visionConfig = `\n# Vision Bridging Settings\nADAPTER ./vision-projector.mmproj\n\nPARAMETER temperature 0.1\nPARAMETER top_p 0.9\nSYSTEM """You are a multimodal expert. Use visual input to provide precision code solutions."""\n`;
          finalFile = visionHeader + result + visionConfig;
        }
        setModelfile(finalFile);
      } finally {
        setIsGenerating(false);
      }
    };
    fetchModelfile();
  }, [config]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const pythonSnippet = `from llama_cpp import Llama\nfrom llama_cpp.llama_chat_format import Llava15ChatHandler\nimport base64\n\n# --- FORGE AI STANDALONE ENGINE ---\n# n_ctx: ${config.contextLength} | multimodal: ${config.visionEnabled ? 'TRUE' : 'FALSE'}\n\ndef run_inference():\n    # 1. Setup Vision Projector (if hybrid model)\n    chat_handler = ${config.visionEnabled ? 'Llava15ChatHandler(clip_model_path="./vision-projector.mmproj")' : 'None'}\n\n    # 2. Load fine-tuned GGUF weights\n    llm = Llama(\n        model_path="./trained-brain.gguf",\n        chat_handler=chat_handler,\n        n_ctx=${config.contextLength},\n        n_gpu_layers=-1 # Use GPU if available\n    )\n\n    print("ForgeAI Engine Online. Type 'exit' to quit.")\n    while True:\n        user_input = input("You > ")\n        if user_input.lower() == "exit": break\n\n        response = llm.create_chat_completion(\n            messages=[{"role": "user", "content": user_input}]\n        )\n        print(f"ForgeAI > {response['choices'][0]['message']['content']}")\n\nif __name__ == "__main__":\n    run_inference()`;

  const handleDownloadFile = (content: string, filename: string) => {
    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    linkElement.click();
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Finish & Use</h2>
          <p className="text-gray-400">Deploy your {config.visionEnabled ? 'Hybrid Vision' : 'Text-Only'} model to your local machine.</p>
        </div>

        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setMode('ollama')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'ollama' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Ollama
          </button>
          <button
            onClick={() => setMode('native')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'native' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Native / Python
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Asset Inventory */}
        <div className="col-span-1 space-y-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Generated Assets</h3>

          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-tighter">The Brain</span>
                <span className="text-[10px] text-gray-600 font-mono">.GGUF</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Modelfile</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed mb-4">The core Ollama configuration containing your fine-tuning instructions.</p>
              <button
                onClick={() => handleDownloadFile(modelfile, 'Modelfile')}
                className="w-full py-2 bg-gray-800 text-xs font-bold text-gray-300 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all"
              >
                Download Modelfile
              </button>
            </div>

            {config.visionEnabled && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 border-l-amber-500/50 hover:border-amber-500/30 transition-all group animate-in slide-in-from-left duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-tighter">The Eyes</span>
                  <span className="text-[10px] text-gray-600 font-mono">.MMPROJ</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">vision-projector.mmproj</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed mb-4">Note: This is a placeholder reference. Real vision projectors must be trained or downloaded separately.</p>
                <button
                  onClick={() => alert("Note: The vision projector (mmproj) cannot be synthesized in-browser. Please use a standard CLIP or SigLIP projector for your base model.")}
                  className="w-full py-2 bg-gray-800 text-xs font-bold text-gray-300 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-all"
                >
                  Projector Info
                </button>
              </div>
            )}
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-[10px] text-gray-400 italic leading-relaxed">
            Note: For the best experience, ensure your local hardware has at least 16GB RAM for vision models.
          </div>
        </div>

        {/* Instructions Area */}
        <div className="lg:col-span-2 flex flex-col space-y-6 overflow-hidden">
          <div className="flex-1 bg-black border border-gray-800 rounded-3xl relative group overflow-hidden flex flex-col">
            <div className="absolute top-4 right-6 text-[10px] text-gray-600 font-mono flex items-center space-x-2 z-20">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-md uppercase">{mode} manifest</span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                  <p className="text-indigo-400 font-medium">Baking instructions...</p>
                </div>
              ) : mode === 'ollama' ? (
                <pre className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {modelfile}
                </pre>
              ) : (
                <div className="space-y-8 font-mono text-sm">
                  <section>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 font-sans border-b border-gray-800 pb-2">Native CLI Server (llama.cpp)</h4>
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-indigo-400 text-xs overflow-x-auto">
                      ./llama-server -m trained-brain.gguf {config.visionEnabled ? '--mmproj vision-projector.mmproj' : ''} --port 8080 --ctx-size {config.contextLength}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 font-sans border-b border-gray-800 pb-2">Python Engine Starter</h4>
                    <p className="text-[10px] text-gray-500 mb-2 font-sans italic">Save this as engine.py and run it with 'python engine.py'. Requires llama-cpp-python.</p>
                    <pre className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-emerald-400 whitespace-pre-wrap text-xs">
                      {pythonSnippet}
                    </pre>
                  </section>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-950/50 backdrop-blur-md flex justify-end">
              <button
                onClick={() => copyToClipboard(mode === 'ollama' ? modelfile : pythonSnippet)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
              >
                Copy Configuration
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default ExportPanel;
