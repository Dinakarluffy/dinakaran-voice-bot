import React, { useState, useEffect, useRef } from 'react';
import { VoiceOrb, BotState } from '@/components/VoiceOrb';
import { QuestionChips } from '@/components/QuestionChips';
import { Transcript, ChatMessage } from '@/components/Transcript';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  Github,
  Linkedin,
  Code,
  Sparkles,
  AlertCircle,
  X,
  Gauge,
  Sun,
  Moon,
  Mic,
} from 'lucide-react';

export default function Home() {
  const [botState, setBotState] = useState<BotState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMicSupported, setIsMicSupported] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
      const initialTheme =
        savedTheme ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

      setTheme(initialTheme);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      synthRef.current = window.speechSynthesis;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsMicSupported(false);
      }
    }
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Stop speaking and clear speech timers
  const stopSpeaking = () => {
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setBotState('idle');
    setSpeakingMessageId(null);
    setCurrentWordIndex(null);
    utteranceRef.current = null;
  };

  // Select a natural male voice across Android, Windows, Mac, and iOS
  const selectMaleVoice = (voices: SpeechSynthesisVoice[]) => {
    if (!voices || voices.length === 0) return undefined;

    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const candidates = englishVoices.length > 0 ? englishVoices : voices;

    const femaleKeywords = [
      'female',
      'woman',
      'samantha',
      'zira',
      'victoria',
      'karen',
      'fiona',
      'tessa',
      'moira',
      'veena',
      'susan',
      'catherine',
      'hazel',
      'jenny',
      'aria',
      'ava',
      'emma',
      'zoe',
      'serena',
      'heera',
      'neerja',
      'aditi',
    ];

    const isNotFemale = (v: SpeechSynthesisVoice) => {
      const lower = v.name.toLowerCase();
      return !femaleKeywords.some((fk) => lower.includes(fk));
    };

    const maleKeywords = [
      'male',
      'daniel',
      'alex',
      'david',
      'mark',
      'george',
      'rishi',
      'prabhat',
      'ravi',
      'oliver',
      'arthur',
      'aaron',
      'guy',
      'james',
      'fred',
      'tom',
      'en-in-x-cxx#male',
      'en-us-x-sfg#male',
      'en-gb-x-rjs#male',
    ];

    // Priority 1: Explicitly named male English voice
    const explicitMale = candidates.find(
      (v) => maleKeywords.some((mk) => v.name.toLowerCase().includes(mk)) && isNotFemale(v)
    );
    if (explicitMale) return explicitMale;

    // Priority 2: Indian English voice that is not female
    const indianVoice = candidates.find(
      (v) => (v.lang === 'en-IN' || v.lang.startsWith('en-IN')) && isNotFemale(v)
    );
    if (indianVoice) return indianVoice;

    // Priority 3: Any English voice that is not female
    const nonFemale = candidates.find(isNotFemale);
    if (nonFemale) return nonFemale;

    return candidates[0];
  };

  // Text-to-Speech function with Dual Karaoke Engine (onboundary + dynamic fallback timer)
  const speakText = (text: string, messageId?: string) => {
    if (isMuted || !synthRef.current) return;

    // Clear previous timer and cancel previous speech
    if (wordTimerRef.current) {
      clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    synthRef.current.cancel();

    // Tokenize text into words
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Retain reference to prevent V8 garbage collection!
    utterance.rate = speechRate;
    utterance.pitch = 0.92; // Slightly deeper masculine pitch

    const voices = synthRef.current.getVoices();
    const preferredVoice = selectMaleVoice(voices);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    let wordIdx = 0;
    let receivedBoundary = false;

    // Dynamic word-by-word stepping timer synchronized with real speech cadence
    const stepNextWord = () => {
      if (wordIdx >= words.length - 1) return;
      const currentWord = words[wordIdx];
      let delay = Math.round(270 / speechRate);

      // Natural speech cadence adjustments
      if (currentWord.endsWith(',') || currentWord.endsWith(';') || currentWord.endsWith(':')) {
        delay += Math.round(80 / speechRate);
      } else if (currentWord.endsWith('.') || currentWord.endsWith('!') || currentWord.endsWith('?')) {
        delay += Math.round(160 / speechRate);
      } else if (currentWord.length > 7) {
        delay += Math.round(40 / speechRate);
      } else if (currentWord.length <= 3) {
        delay = Math.max(130, delay - Math.round(60 / speechRate));
      }

      wordTimerRef.current = setTimeout(() => {
        if (!receivedBoundary) {
          wordIdx++;
          setCurrentWordIndex(wordIdx);
          stepNextWord();
        }
      }, delay);
    };

    utterance.onstart = () => {
      setBotState('speaking');
      setSpeakingMessageId(messageId || null);
      setCurrentWordIndex(0);
      stepNextWord();
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      receivedBoundary = true;
      if (event.charIndex !== undefined && event.charIndex >= 0) {
        let charAcc = 0;
        for (let i = 0; i < words.length; i++) {
          charAcc += words[i].length + 1;
          if (charAcc > event.charIndex) {
            wordIdx = i;
            setCurrentWordIndex(i);
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      stopSpeaking();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      stopSpeaking();
    };

    synthRef.current.speak(utterance);
  };

  // Submit question to Gemini backend API
  const handleAskQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || botState === 'thinking') return;

    setErrorMessage(null);
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTextInput('');
    setBotState('thinking');

    try {
      const hour = new Date().getHours();
      const timeGreeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          timeGreeting,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get answer from AI persona.');
      }

      const botReply = data.reply;
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(botReply, botMsg.id);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setBotState('idle');
    }
  };

  // Toggle Microphone for Voice Input
  const toggleListening = () => {
    if (botState === 'listening') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setBotState('idle');
      return;
    }

    if (botState === 'speaking') {
      stopSpeaking();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Voice input is not supported in this browser. Please type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setBotState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleAskQuestion(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(`Microphone error: ${event.error}`);
        }
        setBotState('idle');
      };

      recognition.onend = () => {
        setBotState((current) => (current === 'listening' ? 'idle' : current));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not activate microphone. Please check browser permissions.');
      setBotState('idle');
    }
  };

  // Clear conversation
  const handleResetConversation = () => {
    stopSpeaking();
    setMessages([]);
    setErrorMessage(null);
    setBotState('idle');
  };

  const toggleSpeechRate = () => {
    setSpeechRate((prev) => (prev === 1.0 ? 1.15 : 1.0));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Navigation Header (Fully Mobile Responsive) */}
      <header className="border-b border-slate-200/90 dark:border-slate-800/90 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl sticky top-0 z-50 transition-colors shadow-sm">
        <div className="max-w-5xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Identity & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-md shadow-indigo-500/25 ring-1 ring-white/20 flex-shrink-0">
              DS
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                  Dinakaran S
                </h1>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 whitespace-nowrap hidden xs:inline-block">
                  AI Twin
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 font-medium whitespace-nowrap">
                <span>100x.inc</span>
                <span>•</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold truncate">AI Assessment</span>
              </p>
            </div>
          </div>

          {/* Social Links & Controls */}
          <div className="flex items-center space-x-0.5 sm:space-x-1.5 text-slate-600 dark:text-slate-300 flex-shrink-0">
            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/Dinakarluffy"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* LeetCode */}
            <a
              href="https://leetcode.com/u/asta_dkn/"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="LeetCode (140+ solved | Rating 1507)"
            >
              <Code className="w-4 h-4" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/dinakaran-s-7ab167312/"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-0.5 sm:mx-1 hidden sm:block" />

            {/* Speech Rate Toggle - hidden on small mobile to prevent crowding */}
            <button
              onClick={toggleSpeechRate}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hidden sm:flex items-center space-x-1 cursor-pointer"
              title={`Speech Speed: ${speechRate}x (Click to change)`}
            >
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
              <span>{speechRate}x</span>
            </button>

            {/* Reset Conversation */}
            {messages.length > 0 && (
              <button
                onClick={handleResetConversation}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with responsive bottom padding */}
      <main className="flex-1 flex flex-col items-center justify-start py-3 sm:py-6 px-2.5 sm:px-4 pb-28 sm:pb-36">
        {/* Quick Start Guide Banner for Interviewers */}
        {showGuide && (
          <div className="w-full max-w-4xl mx-auto mb-3 px-1">
            <div className="rounded-2xl p-3 sm:p-3.5 flex items-start justify-between space-x-3 text-xs bg-white/90 dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-500/20 shadow-sm dark:shadow-lg dark:shadow-indigo-950/40 backdrop-blur-md transition-colors">
              <div className="flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">How to test this Voice Bot:</span>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-normal">
                    1. Tap the central glowing orb to speak into your mic, or tap any preset question chip below.
                    <br className="hidden sm:inline" />
                    2. Make sure your device sound is on to hear Dinakaran answer in real-time.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                title="Dismiss guide"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="w-full max-w-xl mx-auto px-2 mb-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center space-x-2 text-xs text-red-600 dark:text-red-300 shadow-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Central Voice Orb Visualizer */}
        <VoiceOrb
          state={botState}
          onToggleMic={toggleListening}
          isMicSupported={isMicSupported}
        />

        {/* Categorized Question Chips */}
        <QuestionChips
          onSelectQuestion={handleAskQuestion}
          disabled={botState === 'thinking'}
        />

        {/* Conversation Transcript */}
        <Transcript
          messages={messages}
          onReplayAudio={(text, id) => speakText(text, id)}
          speakingMessageId={speakingMessageId}
          currentWordIndex={currentWordIndex}
          botState={botState}
          onToggleMic={toggleListening}
          isMicSupported={isMicSupported}
        />
      </main>

      {/* Sticky Bottom Input Bar with Mic & Safe Mobile Padding */}
      <footer className="border-t border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl fixed bottom-0 left-0 right-0 z-40 py-2 sm:py-2.5 transition-colors shadow-lg">
        <div className="max-w-3xl mx-auto px-2 sm:px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion(textInput);
            }}
            className="flex items-center space-x-1.5 sm:space-x-2"
          >
            {/* Live Microphone Voice Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={!isMicSupported || botState === 'thinking'}
              className={`p-2 sm:px-3.5 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer border flex-shrink-0 ${
                botState === 'listening'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 ring-4 ring-rose-500/30 animate-pulse'
                  : botState === 'speaking'
                  ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-100'
                  : 'bg-indigo-50 dark:bg-slate-900 text-indigo-700 dark:text-cyan-400 border-indigo-200/80 dark:border-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-800 hover:border-indigo-300'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={
                botState === 'listening'
                  ? 'Listening to you... Click to stop'
                  : botState === 'speaking'
                  ? 'Dinakaran is speaking... Click to interrupt & speak'
                  : 'Click to speak question via microphone'
              }
            >
              <Mic
                className={`w-4 h-4 ${
                  botState === 'listening' ? 'animate-bounce text-white' : ''
                }`}
              />
              <span className="hidden sm:inline">
                {botState === 'listening' ? 'Listening...' : 'Speak'}
              </span>
            </button>

            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ask any custom interview question or type here..."
              disabled={botState === 'thinking'}
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || botState === 'thinking'}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold text-xs sm:text-sm hover:from-indigo-500 hover:to-indigo-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1 shadow-md shadow-indigo-600/30 flex-shrink-0 cursor-pointer"
            >
              <span>Ask</span>
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-500 dark:text-slate-500 mt-1 hidden sm:block">
            Powered by Next.js, Google Gemini, and Browser Web Speech API • Zero installation & zero user API key required.
          </p>
        </div>
      </footer>
    </div>
  );
}
