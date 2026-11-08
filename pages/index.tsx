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
  Sliders,
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
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);

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

      // Listen to voice changes dynamically across Android, iOS, Windows, Mac
      const updateVoices = () => {
        if (!synthRef.current) return;
        const voices = synthRef.current.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
          const savedVoiceName = localStorage.getItem('dinakaran_preferred_voice');
          const voiceExists = voices.some((v) => v.name === savedVoiceName);
          if (savedVoiceName && voiceExists) {
            setSelectedVoiceName(savedVoiceName);
          } else {
            const best = selectMaleVoice(voices);
            if (best) {
              setSelectedVoiceName(best.name);
            }
          }
        }
      };

      updateVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

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

  // Explicit female keywords across desktop (Windows/Mac/iOS) and Android (Google/Samsung TTS)
  const FEMALE_VOICE_PATTERNS = [
    /female/i,
    /woman/i,
    /samantha/i,
    /zira/i,
    /victoria/i,
    /karen/i,
    /fiona/i,
    /tessa/i,
    /moira/i,
    /veena/i,
    /susan/i,
    /catherine/i,
    /hazel/i,
    /jenny/i,
    /aria/i,
    /ava/i,
    /emma/i,
    /zoe/i,
    /serena/i,
    /heera/i,
    /neerja/i,
    /aditi/i,
    // Google TTS Android female voice codes
    /en-in-x-cxx/i,
    /en-in-x-end/i,
    /en-in-x-enc/i,
    /en-us-x-sfg/i,
    /en-us-x-tpd/i,
    /en-us-x-tpc/i,
    /en-gb-x-fis/i,
    /en-au-x-afh/i,
    /smt_en_us_f/i,
  ];

  // Explicit male keywords across desktop (Windows/Mac/iOS) and Android (Google/Samsung TTS)
  const MALE_VOICE_PATTERNS = [
    /male/i,
    /david/i,
    /mark/i,
    /alex/i,
    /daniel/i,
    /george/i,
    /rishi/i,
    /prabhat/i,
    /ravi/i,
    /oliver/i,
    /arthur/i,
    /aaron/i,
    /guy/i,
    /james/i,
    /fred/i,
    /tom/i,
    // Google TTS Android male voice codes
    /en-in-x-ahp/i, // Google English India Male 1
    /en-in-x-ena/i, // Google English India Male 2
    /en-us-x-iom/i, // Google English US Male 1
    /en-us-x-iol/i, // Google English US Male 2
    /en-gb-x-rjs/i, // Google English UK Male 1
    // Samsung TTS male voice codes
    /smt_en_us_m/i,
    /smt_en_gb_m/i,
  ];

  const isVoiceExplicitFemale = (v: SpeechSynthesisVoice): boolean => {
    const str = `${v.name} ${v.voiceURI}`.toLowerCase();
    return FEMALE_VOICE_PATTERNS.some((p) => p.test(str));
  };

  const isVoiceExplicitMale = (v: SpeechSynthesisVoice): boolean => {
    const str = `${v.name} ${v.voiceURI}`.toLowerCase();
    return MALE_VOICE_PATTERNS.some((p) => p.test(str)) && !isVoiceExplicitFemale(v);
  };

  // Select a natural male voice across Android, Windows, Mac, and iOS
  const selectMaleVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
    if (!voices || voices.length === 0) return undefined;

    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const candidates = englishVoices.length > 0 ? englishVoices : voices;

    // Priority 1: Indian English male voice (ideal for Dinakaran's persona)
    const indianMale = candidates.find(
      (v) => (v.lang === 'en-IN' || v.lang.startsWith('en-IN')) && isVoiceExplicitMale(v)
    );
    if (indianMale) return indianMale;

    // Priority 2: Any English male voice (David, Mark, Daniel, Alex, iom, iol, rjs, etc.)
    const anyMale = candidates.find(isVoiceExplicitMale);
    if (anyMale) return anyMale;

    // Priority 3: Indian English voice that is NOT explicitly female
    const indianNonFemale = candidates.find(
      (v) => (v.lang === 'en-IN' || v.lang.startsWith('en-IN')) && !isVoiceExplicitFemale(v)
    );
    if (indianNonFemale) return indianNonFemale;

    // Priority 4: Any English voice that is NOT explicitly female
    const englishNonFemale = candidates.find((v) => !isVoiceExplicitFemale(v));
    if (englishNonFemale) return englishNonFemale;

    return candidates[0];
  };

  // Text-to-Speech function with Dual Karaoke Engine (onboundary + calibrated speech timing)
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

    const voices = synthRef.current.getVoices();
    let chosenVoice: SpeechSynthesisVoice | undefined;

    if (selectedVoiceName) {
      chosenVoice = voices.find((v) => v.name === selectedVoiceName);
    }
    if (!chosenVoice) {
      chosenVoice = selectMaleVoice(voices);
      if (chosenVoice) {
        setSelectedVoiceName(chosenVoice.name);
      }
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    // Dynamic pitch:
    // If the voice is a verified male voice, pitch = 0.94 (crisp, masculine).
    // If the voice is unverified, generic, or an Android fallback voice, pitch = 0.78
    // (pitch 0.78 shifts female/neutral voices down by ~4-5 semitones into a natural masculine baritone!).
    const isKnownMale = chosenVoice ? isVoiceExplicitMale(chosenVoice) : false;
    utterance.pitch = isKnownMale ? 0.94 : 0.78;

    let wordIdx = 0;
    let receivedWordBoundary = false;

    // Dynamic word-by-word stepping timer calibrated to natural ~138 WPM speech
    const stepNextWord = () => {
      if (wordIdx >= words.length - 1) return;
      const currentWord = words[wordIdx];
      let delay = 380; // Base duration per word for natural conversational pace (~138 WPM)

      // Numbers & Acronyms take longer to pronounce (e.g. 2026 -> twenty twenty-six, B.Tech -> B Tech)
      if (/\d/.test(currentWord)) {
        delay += 420;
      } else if (/[A-Z]{2,}/.test(currentWord) || (currentWord.includes('.') && currentWord.length > 2)) {
        delay += 260;
      }

      // Syllables and length adjustments
      if (currentWord.length <= 3) {
        delay = Math.max(220, delay - 140);
      } else if (currentWord.length >= 12) {
        delay += 260;
      } else if (currentWord.length >= 8) {
        delay += 130;
      }

      // Punctuation pauses (emulating human and TTS cadence)
      if (currentWord.endsWith(',') || currentWord.endsWith(';') || currentWord.endsWith(':') || currentWord.includes('—')) {
        delay += 260;
      } else if (currentWord.endsWith('.') || currentWord.endsWith('!') || currentWord.endsWith('?')) {
        delay += 520;
      }

      const finalDelay = Math.round(delay / speechRate);

      wordTimerRef.current = setTimeout(() => {
        if (!receivedWordBoundary) {
          wordIdx++;
          setCurrentWordIndex(wordIdx);
          stepNextWord();
        }
      }, finalDelay);
    };

    utterance.onstart = () => {
      setBotState('speaking');
      setSpeakingMessageId(messageId || null);
      setCurrentWordIndex(0);
      stepNextWord();
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      // If the browser natively emits word boundaries (like desktop Chrome, Safari, Edge)
      if (event.name === 'word' || (!event.name && event.charIndex !== undefined && event.charIndex > 0)) {
        receivedWordBoundary = true;
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
      } else if (event.name === 'sentence' && event.charIndex !== undefined) {
        // Some mobile browsers emit sentence boundary! Resync wordIdx to sentence start
        let charAcc = 0;
        for (let i = 0; i < words.length; i++) {
          if (charAcc >= event.charIndex) {
            wordIdx = i;
            setCurrentWordIndex(i);
            break;
          }
          charAcc += words[i].length + 1;
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

            {/* Voice & Sound Settings Toggle */}
            <button
              onClick={() => setShowVoiceModal(true)}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Voice & Speech Settings"
            >
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
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

            {/* LeetCode (hidden on mobile to prevent crowding, visible on tablet/desktop) */}
            <a
              href="https://leetcode.com/u/asta_dkn/"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hidden sm:flex"
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

      {/* Voice Synthesizer & Sound Settings Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Voice & Speech Engine
                </h3>
              </div>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Synthesizer Voice (Current: {selectedVoiceName || 'Auto-Detected Male'})
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => {
                    setSelectedVoiceName(e.target.value);
                    localStorage.setItem('dinakaran_preferred_voice', e.target.value);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 text-xs"
                >
                  {availableVoices.map((v) => {
                    const isMale = isVoiceExplicitMale(v);
                    const isFemale = isVoiceExplicitFemale(v);
                    const tag = isMale
                      ? ' [Male - Recommended]'
                      : isFemale
                      ? ' [Female]'
                      : '';
                    return (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang}){tag}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Default male acoustic modeling is automatically configured.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Speech Speed ({speechRate}x)
                </label>
                <div className="flex space-x-2">
                  {[0.75, 1.0, 1.25].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setSpeechRate(rate)}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                        speechRate === rate
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    speakText(
                      'Good morning! I am Dinakaran S, a 2026 graduate engineer from SASTRA University.'
                    );
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Preview Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
