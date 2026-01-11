
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DatasetManager from './components/DatasetManager';
import ConfigPanel from './components/ConfigPanel';
import TrainingLab from './components/TrainingLab';
import ExportPanel from './components/ExportPanel';
import AutoForge from './components/AutoForge';
import TestBench from './components/TestBench';
import AlignmentLab from './components/AlignmentLab';
import ToolForge from './components/ToolForge';
import HelpOverlay from './components/HelpOverlay';
import MediaLab from './components/MediaLab';
import { TrainingConfig, TrainingPair, TrainingStatus, TrainingLog, MetricPoint, ModelVersion, PreferencePair } from './types';
import { setGeminiApiKey } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('autoforge');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const [dataset, setDataset] = useState<TrainingPair[]>([]);
  const [preferences, setPreferences] = useState<PreferencePair[]>([]);
  const [config, setConfig] = useState<TrainingConfig>({
    baseModel: 'llama3:8b',
    epochs: 3,
    learningRate: 0.00005,
    batchSize: 4,
    contextLength: 2048,
    visionEnabled: false,
    visionEncoder: 'CLIP-ViT-L/14',
    tools: [],
    trainingMethod: 'SFT',
    reasoningMode: true
  });

  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>(TrainingStatus.IDLE);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
  const [trainingMetrics, setTrainingMetrics] = useState<MetricPoint[]>([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>([]);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (e) {
          console.warn("AI Studio key check failed", e);
          setHasApiKey(false);
        }
      } else {
        // Fallback for local dev: check if we already have a key in localStorage
        const savedKey = localStorage.getItem('my_llama_api_key');
        if (savedKey) {
          setGeminiApiKey(savedKey);
          setHasApiKey(true);
        } else {
          setHasApiKey(false);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    } else {
      alert("Cloud configuration is not available in local mode. Please enter an API key manually.");
    }
  };

  const handleManualKey = () => {
    if (!apiKeyInput) return;
    setGeminiApiKey(apiKeyInput);
    setHasApiKey(true);
    // Persist for session if needed
    localStorage.setItem('my_llama_api_key', apiKeyInput);
  };


  const loadVersion = (version: ModelVersion) => {
    setConfig(version.config);
    setTrainingStatus(version.status);
    setTrainingLogs(version.logs);
    setTrainingMetrics(version.metrics);
    setTrainingProgress(version.progress);
  };

  const handleAutoForgePlan = (newConfig: TrainingConfig, newLessons: TrainingPair[]) => {
    setConfig(newConfig);
    setDataset(newLessons);
  };

  const startAutomatedTraining = () => {
    setActiveTab('training');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'autoforge': return <AutoForge onPlanReady={handleAutoForgePlan} startTraining={startAutomatedTraining} />;
      case 'dataset': return <DatasetManager dataset={dataset} setDataset={setDataset} config={config} />;
      case 'medialab': return <MediaLab setDataset={setDataset} />;
      case 'alignment': return <AlignmentLab preferences={preferences} setPreferences={setPreferences} config={config} />;
      case 'toolforge': return <ToolForge config={config} setConfig={setConfig} setDataset={setDataset} />;
      case 'config': return <ConfigPanel config={config} setConfig={setConfig} />;
      case 'training': return <TrainingLab config={config} dataset={dataset} status={trainingStatus} setStatus={setTrainingStatus} logs={trainingLogs} setLogs={setTrainingLogs} metrics={trainingMetrics} setMetrics={setTrainingMetrics} progress={trainingProgress} setProgress={setTrainingProgress} versions={modelVersions} setVersions={setModelVersions} onLoadVersion={loadVersion} />;
      case 'testbench': return <TestBench config={config} dataset={dataset} status={trainingStatus} />;
      case 'export': return <ExportPanel config={config} />;
      default: return <AutoForge onPlanReady={handleAutoForgePlan} startTraining={startAutomatedTraining} />;
    }
  };

  if (hasApiKey === null) return null;

  if (!hasApiKey) {
    return (
      <div className="flex h-screen bg-gray-950 items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e1b4b_0%,_transparent_70%)] opacity-50" />
        <div className="max-w-md w-full bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 flex flex-col items-center text-center space-y-10 shadow-2xl relative z-10">
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full" />
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl relative">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tight">My Llama</h1>
            <p className="text-gray-400 text-sm leading-relaxed">Initialize your neural studio by selecting an authorized API project key.</p>
          </div>
          <div className="space-y-4 w-full">
            <div className="relative group">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter Gemini API Key..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-sm"
              />
            </div>
            <button
              onClick={handleManualKey}
              disabled={!apiKeyInput}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Initialize Studio
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleSelectKey}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest transition-colors"
            >
              Use Project Key Configuration
            </button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-500 hover:text-indigo-400 font-bold uppercase tracking-widest transition-colors">Documentation & Billing</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#030712] overflow-hidden text-gray-100 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-50" />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenDocumentation={() => setIsHelpOpen(true)} />

      <main className="flex-1 relative overflow-hidden flex flex-col bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_60%)]">
        <header className="h-20 border-b border-white/5 bg-gray-950/40 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 z-20">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Project ID</span>
              <span className="text-sm font-mono text-gray-400">my-llama-v1.0</span>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${trainingStatus === TrainingStatus.TRAINING ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-gray-600'}`} />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-tighter">
                {trainingStatus === TrainingStatus.TRAINING ? 'Neural Tempering in Progress' : 'Studio Idle'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-black text-gray-500 uppercase">Load</span>
              <span className="text-xs font-mono text-white">{(dataset.length + preferences.length).toString().padStart(3, '0')}</span>
            </div>
            <button
              onClick={handleSelectKey}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
              title="Switch Keys"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-8 lg:p-12">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>

        <HelpOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </main>
    </div>
  );
};

export default App;
