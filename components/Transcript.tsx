import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Copy, Check, User, Bot, Sparkles, Mic, Loader2 } from 'lucide-react';
import { BotState } from './VoiceOrb';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface TranscriptProps {
  messages: ChatMessage[];
  onReplayAudio: (text: string, messageId: string) => void;
  speakingMessageId?: string | null;
  currentWordIndex?: number | null;
  botState?: BotState;
  onToggleMic?: () => void;
  isMicSupported?: boolean;
}

interface TextToken {
  text: string;
  isWord: boolean;
  wordIndex?: number;
}

const tokenizeText = (text: string): TextToken[] => {
  const tokens: TextToken[] = [];
  const regex = /(\S+|\s+)/g;
  let match;
  let wordCount = 0;

  while ((match = regex.exec(text)) !== null) {
    const chunk = match[0];
    const isWord = !/^\s+$/.test(chunk);
    tokens.push({
      text: chunk,
      isWord,
      wordIndex: isWord ? wordCount++ : undefined,
    });
  }

  return tokens;
};

export const Transcript: React.FC<TranscriptProps> = ({
  messages,
  onReplayAudio,
  speakingMessageId,
  currentWordIndex,
  botState = 'idle',
  onToggleMic,
  isMicSupported = true,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botState]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render real-time word-by-word karaoke highlighting
  const renderMessageContent = (text: string, isSpeakingThis: boolean) => {
    if (!isSpeakingThis || currentWordIndex === null || currentWordIndex === undefined) {
      return <p className="whitespace-pre-wrap leading-relaxed font-normal">{text}</p>;
    }

    const tokens = tokenizeText(text);

    return (
      <p className="whitespace-pre-wrap leading-relaxed font-normal">
        {tokens.map((token, idx) => {
          if (!token.isWord) {
            return <span key={idx}>{token.text}</span>;
          }

          const isActive = token.wordIndex === currentWordIndex;

          if (isActive) {
            return (
              <span
                key={idx}
                className="font-black text-indigo-700 dark:text-cyan-300 bg-indigo-100/95 dark:bg-cyan-950/95 px-1.5 py-0.5 rounded-md ring-2 ring-indigo-400/80 dark:ring-cyan-400/80 shadow-md transition-all inline-block scale-105 mx-0.5"
              >
                {token.text}
              </span>
            );
          }

          return <span key={idx}>{token.text}</span>;
        })}
      </p>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 text-center select-none">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs sm:text-sm shadow-sm transition-colors">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Tap the central orb or click any question chip above to start.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 my-4 sm:my-6 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 transition-colors">
        <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Interview Conversation Transcript ({messages.length})
        </h3>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">Live Voice Sync</span>
      </div>

      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        const isSpeakingThis =
          !isUser && msg.id === speakingMessageId && botState === 'speaking';

        return (
          <div
            key={msg.id}
            className={`flex items-start space-x-2 sm:space-x-3 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Bot Avatar */}
            {!isUser && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-indigo-500/20 mt-1 ring-2 ring-cyan-400/50">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`relative max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                isUser
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                  : `rounded-tl-none border shadow-sm ${
                      isSpeakingThis
                        ? 'border-cyan-500 ring-2 ring-cyan-400/30 bg-cyan-50/70 dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                        : 'bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`
              }`}
            >
              {/* Header inside Bubble */}
              <div className="flex items-center justify-between mb-1.5 space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[11px] sm:text-xs font-bold ${
                      isUser
                        ? 'text-indigo-200'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isUser ? 'You (Interviewer)' : 'Dinakaran S'}
                  </span>
                  {isSpeakingThis && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                      <span>Speaking aloud</span>
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] ${
                    isUser ? 'text-indigo-200/80' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {/* Message Content with Real-Time Word Highlight */}
              {renderMessageContent(msg.text, isSpeakingThis)}

              {/* Action Buttons for Bot Responses */}
              {!isUser && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {/* Play Audio Button (disabled/speaking-indicator while bot is speaking) */}
                  {isSpeakingThis ? (
                    <div
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-100/70 dark:bg-cyan-950/70 border border-cyan-400/50 shadow-sm select-none cursor-default"
                      title="Dinakaran is currently speaking this answer aloud"
                    >
                      <span className="flex space-x-0.5 items-end h-3">
                        <span className="w-1 h-2 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce" />
                        <span className="w-1 h-3.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1 h-2.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </span>
                      <span>Speaking aloud...</span>
                    </div>
                  ) : (
                    <button
                      disabled={botState !== 'idle'}
                      onClick={() => onReplayAudio(msg.text, msg.id)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        botState !== 'idle'
                          ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600 border border-transparent'
                          : 'text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-transparent hover:border-cyan-300 dark:hover:border-cyan-500/30 cursor-pointer'
                      }`}
                      title={
                        botState !== 'idle'
                          ? 'Audio playback in progress. Please wait until speech finishes.'
                          : 'Play Audio Aloud'
                      }
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Play Audio</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    title="Copy Answer Text"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-white shadow-md mt-1 ring-2 ring-indigo-400">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}
          </div>
        );
      })}

      {/* Real-time Thinking Bubble */}
      {botState === 'thinking' && (
        <div className="flex items-start space-x-2 sm:space-x-3 justify-start animate-fade-in">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-indigo-500/20 mt-1 ring-2 ring-cyan-400/50">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="rounded-2xl rounded-tl-none p-3.5 sm:p-4 text-xs sm:text-sm bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center space-x-2.5 shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500 flex-shrink-0" />
            <span className="font-medium">
              Dinakaran is thinking & formulating answer...
            </span>
          </div>
        </div>
      )}

      {/* Quick Voice / Next Question Action Bar directly beneath latest answer */}
      {messages.length > 0 && onToggleMic && botState !== 'thinking' && (
        <div className="pt-2 sm:pt-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-cyan-50/90 dark:from-slate-900/95 dark:via-slate-900 dark:to-cyan-950/40 border border-indigo-200/80 dark:border-indigo-500/20 shadow-sm transition-all">
            <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-cyan-400 flex-shrink-0" />
              <span className="font-medium">
                {botState === 'speaking'
                  ? 'Dinakaran is speaking aloud...'
                  : botState === 'listening'
                  ? 'Listening to you now! Speak your question...'
                  : 'Ready for your next question! Ask via voice or type below.'}
              </span>
            </div>

            <button
              onClick={onToggleMic}
              disabled={!isMicSupported}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md ${
                botState === 'listening'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 ring-4 ring-rose-500/30 animate-pulse'
                  : botState === 'speaking'
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/30'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-600/25 active:scale-95'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={botState === 'listening' ? 'Click to stop listening' : 'Click to speak question'}
            >
              <Mic
                className={`w-4 h-4 ${
                  botState === 'listening' ? 'animate-bounce text-white' : ''
                }`}
              />
              <span>
                {botState === 'listening'
                  ? 'Stop Listening'
                  : botState === 'speaking'
                  ? 'Interrupt & Speak'
                  : '🎙️ Tap to Speak Next Question'}
              </span>
            </button>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
