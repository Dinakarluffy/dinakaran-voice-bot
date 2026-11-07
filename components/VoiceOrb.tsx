import React from 'react';
import { Mic, Loader2 } from 'lucide-react';

export type BotState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceOrbProps {
  state: BotState;
  onToggleMic: () => void;
  isMicSupported: boolean;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  onToggleMic,
  isMicSupported,
}) => {
  return (
    <div className="flex flex-col items-center justify-center my-5 sm:my-8 select-none">
      {/* Outer Glow & Orb Wrapper */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Backlight Rings */}
        {state === 'listening' && (
          <>
            <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-emerald-500/30 blur-2xl animate-pulse" />
          </>
        )}
        {state === 'speaking' && (
          <>
            <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-cyan-500/20 animate-ping" />
            <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-cyan-500/30 to-indigo-500/40 blur-2xl animate-pulse" />
          </>
        )}
        {state === 'thinking' && (
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-r from-purple-600/40 via-pink-500/30 to-indigo-600/40 animate-spin-slow blur-2xl" />
        )}
        {state === 'idle' && (
          <>
            <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-indigo-500/20 dark:bg-indigo-500/25 blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-cyan-400/10 dark:bg-cyan-400/15 blur-xl animate-pulse-slow" />
          </>
        )}

        {/* Central Hero Orb Button */}
        <button
          onClick={onToggleMic}
          disabled={!isMicSupported}
          aria-label={state === 'listening' ? 'Stop listening' : 'Start voice question'}
          className={`relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-500 focus:outline-none focus:ring-4 active:scale-95 cursor-pointer shadow-2xl ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-emerald-500/50 scale-105 ring-emerald-400/70 border-2 border-emerald-300'
              : state === 'thinking'
              ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-500 text-white shadow-purple-500/50 scale-100 ring-purple-400/70 border-2 border-purple-300'
              : state === 'speaking'
              ? 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-cyan-500/50 scale-105 ring-cyan-400/70 border-2 border-cyan-300'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-indigo-600/40 dark:shadow-indigo-950/80 hover:scale-105 hover:shadow-indigo-500/50 ring-indigo-400/30 dark:ring-indigo-500/40 border-2 border-indigo-400/50 dark:border-indigo-400/40'
          }`}
        >
          {/* Inner Visualizer Waveforms & Icons */}
          {state === 'listening' && (
            <div className="flex flex-col items-center">
              <Mic className="w-9 h-9 sm:w-11 sm:h-11 text-white animate-bounce drop-shadow-md" />
              <span className="text-[11px] sm:text-xs font-bold text-white mt-1.5 uppercase tracking-wider drop-shadow">
                Listening...
              </span>
            </div>
          )}

          {state === 'thinking' && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-9 h-9 sm:w-11 sm:h-11 text-white animate-spin drop-shadow-md" />
              <span className="text-[11px] sm:text-xs font-bold text-white mt-1.5 uppercase tracking-wider drop-shadow">
                Thinking...
              </span>
            </div>
          )}

          {state === 'speaking' && (
            <div className="flex flex-col items-center">
              {/* Dynamic Soundwave Equalizer Bars */}
              <div className="flex items-center space-x-1.5 h-9 sm:h-11 mb-1">
                <span className="equalizer-bar animate-wave-1 h-3" />
                <span className="equalizer-bar animate-wave-2 h-7" />
                <span className="equalizer-bar animate-wave-3 h-10" />
                <span className="equalizer-bar animate-wave-4 h-6" />
                <span className="equalizer-bar animate-wave-5 h-9" />
                <span className="equalizer-bar animate-wave-2 h-5" />
                <span className="equalizer-bar animate-wave-1 h-3" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider drop-shadow">
                Speaking...
              </span>
            </div>
          )}

          {state === 'idle' && (
            <div className="flex flex-col items-center group">
              <div className="p-2 sm:p-2.5 rounded-full bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white/95 mt-1 sm:mt-1.5 tracking-tight drop-shadow">
                Tap to Talk
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Live Status Pill (Light/Dark Aware) */}
      <div className="mt-4 sm:mt-5 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm shadow-sm backdrop-blur-md transition-colors">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            state === 'listening'
              ? 'bg-emerald-500 animate-ping'
              : state === 'thinking'
              ? 'bg-purple-500 animate-spin'
              : state === 'speaking'
              ? 'bg-cyan-500 animate-pulse'
              : 'bg-indigo-500'
          }`}
        />
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          {state === 'listening' && 'Listening to your question...'}
          {state === 'thinking' && 'Thinking as Dinakaran S...'}
          {state === 'speaking' && 'Dinakaran is speaking aloud (Tap orb to interrupt)'}
          {state === 'idle' && 'Click the orb to speak, or tap a question below'}
        </span>
      </div>
    </div>
  );
};
