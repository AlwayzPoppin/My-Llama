
import React, { useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrainingStatus, TrainingLog, MetricPoint, TrainingConfig, TrainingPair, ModelVersion } from '../types';

interface TrainingLabProps {
  config: TrainingConfig;
  dataset: TrainingPair[];
  status: TrainingStatus;
  setStatus: (s: TrainingStatus) => void;
  logs: TrainingLog[];
  setLogs: React.Dispatch<React.SetStateAction<TrainingLog[]>>;
  metrics: MetricPoint[];
  setMetrics: React.Dispatch<React.SetStateAction<MetricPoint[]>>;
  progress: number;
  setProgress: (p: number) => void;
  versions: ModelVersion[];
  setVersions: React.Dispatch<React.SetStateAction<ModelVersion[]>>;
  onLoadVersion: (v: ModelVersion) => void;
}

const TrainingLab: React.FC<TrainingLabProps> = ({ config, dataset, status, setStatus, logs, setLogs, metrics, setMetrics, progress, setProgress, versions, setVersions, onLoadVersion }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const interruptRef = useRef<boolean>(false);

  const addLog = (message: string, level: TrainingLog['level'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), level, message }]);
  };

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  useEffect(() => {
    let interval: any;
    if (status === TrainingStatus.TRAINING) {
      interruptRef.current = false;
      const totalSteps = config.epochs * 10;
      let step = metrics.length > 0 ? metrics[metrics.length - 1].step : 0;
      interval = setInterval(() => {
        if (interruptRef.current) {
          setStatus(TrainingStatus.PAUSED);
          addLog("Neural Tempering Interrupted.", 'warn');
          clearInterval(interval);
          return;
        }
        step++;
        const currentProgress = (step / totalSteps) * 100;
        setProgress(currentProgress);
        const loss = Math.max(0.01, 2.5 * Math.pow(0.97, step));
        const accuracy = Math.min(0.99, 0.4 + (0.6 * (1 - Math.pow(0.95, step))));
        setMetrics(prev => [...prev, { step, loss, accuracy }]);
        if (step % 5 === 0) addLog(`Cycle ${Math.floor(step / 10) + 1} | Convergence: ${(accuracy * 100).toFixed(1)}% | Error: ${loss.toFixed(4)}`);
        if (step >= totalSteps) {
          clearInterval(interval);
          setStatus(TrainingStatus.COMPLETED);
          addLog("Neural Casting Finalized. Weights Stabilized.", 'success');
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const toggleTraining = () => {
    if (status === TrainingStatus.IDLE || status === TrainingStatus.COMPLETED) {
      if (dataset.length === 0) return addLog("Curriculum Empty. Load data first.", 'error');
      setLogs([]); setMetrics([]); setProgress(0); setStatus(TrainingStatus.PREPARING);
      setTimeout(() => setStatus(TrainingStatus.TRAINING), 1000);
    } else if (status === TrainingStatus.TRAINING) interruptRef.current = true;
    else if (status === TrainingStatus.PAUSED) setStatus(TrainingStatus.TRAINING);
  };

  return (
    <div className="h-full flex flex-col space-y-8 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white leading-none">Neural Tempering</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Process State: <span className="text-indigo-400">{status}</span></p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTraining} className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${status === TrainingStatus.TRAINING ? 'bg-amber-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
            {status === TrainingStatus.TRAINING ? 'Interrupt' : status === TrainingStatus.PAUSED ? 'Resume' : 'Begin Tempering'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
        <div className="lg:col-span-3 flex flex-col space-y-8 overflow-hidden">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[3rem] p-10 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Convergence Analytics</span>
                <span className="text-xs text-gray-500 mt-1">Real-time loss/accuracy telemetry</span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[10px] text-gray-400 font-bold uppercase">Loss</span></div>
                <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-gray-400 font-bold uppercase">Accuracy</span></div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="step" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#818cf8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#818cf8" strokeWidth={3} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex flex-col space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Forge Saturation</span>
                <span className="text-4xl font-black text-white mt-1">{Math.floor(progress)}%</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weights State</span>
                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${status === TrainingStatus.TRAINING ? 'bg-indigo-500 text-white animate-pulse' : 'bg-white/10 text-gray-400'}`}>{status}</div>
              </div>
            </div>
            <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className={`h-full transition-all duration-700 ease-out bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]`} style={{ width: `${progress}%` }}>
                {status === TrainingStatus.TRAINING && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-40 -translate-x-full animate-[scan_1.5s_infinite]" />}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-black border border-white/5 rounded-[3rem] flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Telemetry Log</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 font-mono text-[10px] space-y-3 custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="flex space-x-3 leading-relaxed">
                <span className="text-gray-700 shrink-0">[{log.timestamp}]</span>
                <span className={log.level === 'error' ? 'text-red-400' : log.level === 'success' ? 'text-emerald-400' : 'text-gray-300'}>{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan { from { transform: translateX(-100%) skewX(-20deg); } to { transform: translateX(300%) skewX(-20deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TrainingLab;
