import React, { useState } from 'react';
import { PRESET_QUESTIONS, PresetQuestion } from '@/lib/questions';
import { Sparkles, Terminal, ShieldCheck, Compass, Dices, Layers } from 'lucide-react';

interface QuestionChipsProps {
  onSelectQuestion: (question: string) => void;
  disabled: boolean;
}

export const QuestionChips: React.FC<QuestionChipsProps> = ({
  onSelectQuestion,
  disabled,
}) => {
  // Default to 100x Brief so screen is never crowded on first glance
  const [activeTab, setActiveTab] = useState<
    '100x Brief' | 'IncuBrix Deep Dives' | 'Academic Projects' | 'Culture & Work Style' | 'all'
  >('100x Brief');

  const briefQuestions = PRESET_QUESTIONS.filter((q) => q.category === '100x Brief');
  const incubrixQuestions = PRESET_QUESTIONS.filter((q) => q.category === 'IncuBrix Deep Dives');
  const academicQuestions = PRESET_QUESTIONS.filter((q) => q.category === 'Academic Projects');
  const cultureQuestions = PRESET_QUESTIONS.filter((q) => q.category === 'Culture & Work Style');

  const handleRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * PRESET_QUESTIONS.length);
    onSelectQuestion(PRESET_QUESTIONS[randomIndex].question);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-2 px-3 sm:px-4">
      {/* Category Tabs & Surprise Me */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3.5 transition-colors">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {/* Stage 1 Brief (Featured) */}
          <button
            onClick={() => setActiveTab('100x Brief')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === '100x Brief'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 bg-amber-500/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stage 1 Brief ({briefQuestions.length})</span>
          </button>

          {/* IncuBrix Deep Dives */}
          <button
            onClick={() => setActiveTab('IncuBrix Deep Dives')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'IncuBrix Deep Dives'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25 ring-2 ring-cyan-400/40'
                : 'text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-950/40 bg-cyan-500/10'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>IncuBrix Deep Dives ({incubrixQuestions.length})</span>
          </button>

          {/* Academic Projects */}
          <button
            onClick={() => setActiveTab('Academic Projects')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'Academic Projects'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/40'
                : 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 bg-emerald-500/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Academic Projects ({academicQuestions.length})</span>
          </button>

          {/* Culture & Work Style */}
          <button
            onClick={() => setActiveTab('Culture & Work Style')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'Culture & Work Style'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-400/40'
                : 'text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40 bg-purple-500/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Work Style ({cultureQuestions.length})</span>
          </button>

          {/* All Questions */}
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Show All ({PRESET_QUESTIONS.length})</span>
          </button>
        </div>

        {/* Surprise Me Button */}
        <button
          onClick={handleRandomQuestion}
          disabled={disabled}
          title="Ask a random interview question"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all flex-shrink-0 ml-2 cursor-pointer"
        >
          <Dices className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span>Surprise Me</span>
        </button>
      </div>

      {/* Questions Container */}
      <div className="space-y-4">
        {/* Stage 1 Brief Tab */}
        {(activeTab === 'all' || activeTab === '100x Brief') && (
          <div>
            <div className="flex items-center space-x-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>100x Assessment Brief & Self Introduction</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {briefQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelectQuestion(q.question)}
                  disabled={disabled}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer active:scale-95 border bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400 dark:hover:border-amber-400"
                >
                  {q.shortLabel}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* IncuBrix Deep Dives Tab */}
        {(activeTab === 'all' || activeTab === 'IncuBrix Deep Dives') && (
          <div className={activeTab === 'all' ? 'pt-3 border-t border-slate-200 dark:border-slate-800' : ''}>
            <div className="flex items-center space-x-2 mb-2 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-500" />
              <span>IncuBrix Production Deep Dives (CloudWatch, OOM Fix, Files API)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {incubrixQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelectQuestion(q.question)}
                  disabled={disabled}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer active:scale-95 border bg-white dark:bg-slate-900 border-cyan-300 dark:border-cyan-500/30 text-cyan-900 dark:text-cyan-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:border-cyan-400 dark:hover:border-cyan-400"
                >
                  {q.shortLabel}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Academic Projects Tab */}
        {(activeTab === 'all' || activeTab === 'Academic Projects') && (
          <div className={activeTab === 'all' ? 'pt-3 border-t border-slate-200 dark:border-slate-800' : ''}>
            <div className="flex items-center space-x-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Academic Projects (Cryptography & Django Security Platform)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {academicQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelectQuestion(q.question)}
                  disabled={disabled}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer active:scale-95 border bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400 dark:hover:border-emerald-400"
                >
                  {q.shortLabel}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Culture & Work Style Tab */}
        {(activeTab === 'all' || activeTab === 'Culture & Work Style') && (
          <div className={activeTab === 'all' ? 'pt-3 border-t border-slate-200 dark:border-slate-800' : ''}>
            <div className="flex items-center space-x-2 mb-2 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              <Compass className="w-3.5 h-3.5 text-purple-500" />
              <span>Culture & Work Philosophy (US Hours, Why 100x)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cultureQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onSelectQuestion(q.question)}
                  disabled={disabled}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer active:scale-95 border bg-white dark:bg-slate-900 border-purple-300 dark:border-purple-500/30 text-purple-900 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-400 dark:hover:border-purple-400"
                >
                  {q.shortLabel}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
