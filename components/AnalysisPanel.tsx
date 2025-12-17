import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Contact, CommunicationStyle } from '../types';

interface AnalysisPanelProps {
  contact: Contact;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ contact, onAnalyze, isAnalyzing }) => {
  const style = contact.analysis;

  if (isAnalyzing || !style) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
        <div className="relative mb-6">
           <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
             <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2">Analyzing History</h3>
        <p className="text-slate-600 text-sm mb-6 max-w-xs animate-pulse">
          Scanning {contact.name}'s conversation patterns...
        </p>
      </div>
    );
  }

  const chartData = [
    { subject: 'Formality', A: style.formality, fullMark: 100 },
    { subject: 'Warmth', A: style.warmth, fullMark: 100 },
    { subject: 'Humor', A: style.humor, fullMark: 100 },
    { subject: 'Brevity', A: style.brevity, fullMark: 100 },
    { subject: 'Emoji Usage', A: style.emojiUsage, fullMark: 100 },
  ];

  return (
    <div className="h-full overflow-y-auto bg-white p-6 border-l border-slate-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Analysis Result</h2>
          <p className="text-sm text-slate-500">Based on your history with {contact.name}</p>
        </div>
        <button 
          onClick={onAnalyze}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Refresh Analysis"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-6 shadow-inner relative group">
        <p className="text-slate-700 italic text-sm leading-relaxed">"{style.description}"</p>
      </div>

      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="My Style"
              dataKey="A"
              stroke="#6366f1"
              strokeWidth={2}
              fill="#818cf8"
              fillOpacity={0.5}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Signature Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {style.keywords.map((word, i) => (
            <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              {word}
            </span>
          ))}
        </div>
      </div>
      
      {contact.lastAnalyzed && (
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Last analyzed: {new Date(contact.lastAnalyzed).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};