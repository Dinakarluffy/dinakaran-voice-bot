# 🛠️ Implementation Plan — Dinakaran Voice Bot

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14 (Pages Router) | Clean structure, built-in API routes for backend, perfect Vercel deploy |
| **Language** | TypeScript | Professional, type-safe, expected at an AI engineering role |
| **Styling** | Tailwind CSS | Fast to build, clean UI without custom CSS overhead |
| **LLM API** | Google Gemini API (`gemini-1.5-flash`) | Free, fast, user already has key |
| **Speech-to-Text (STT)** | Browser Web Speech API | Zero cost, zero API key, works natively in Chrome/Edge/Safari |
| **Text-to-Speech (TTS)** | Browser SpeechSynthesis API | Zero cost, zero API key, speaks responses aloud |
| **Deployment** | Vercel (Free Tier) | One-click from GitHub, gives a public HTTPS URL instantly |
| **Env Management** | `.env.local` (local) + Vercel Env Vars (production) | GEMINI_API_KEY hidden from frontend users at all times |

> **Why NOT OpenAI?** Gemini API is free on the developer tier, Dinakaran already has a key, and the quality for conversational QA is excellent with `gemini-1.5-flash`.

> **Why Web Speech API for STT/TTS?** The brief says non-technical users must be able to test with no API key entry. Web Speech API needs ZERO external API keys. It runs entirely in the browser. Best choice for this constraint.

---

## Project Folder Structure

```
D:\100x Assignment\
├── pages/
│   ├── index.tsx          ← Main UI (voice bot interface)
│   └── api/
│       └── chat.ts        ← Backend: accepts question → calls Gemini → returns answer
├── lib/
│   └── persona.ts         ← Dinakaran's system prompt + Q&A ground truth
├── components/
│   ├── MicButton.tsx      ← Animated mic button, handles STT lifecycle
│   ├── QuestionChips.tsx  ← 5 clickable preset question buttons
│   └── ChatBubble.tsx     ← Displays Q&A conversation history
├── styles/
│   └── globals.css        ← Tailwind base styles
├── public/
│   └── favicon.ico
├── about_project.md       ← This project's context (not committed if in .gitignore)
├── implementation_plan.md ← This file
├── .env.local             ← GEMINI_API_KEY (never committed)
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Feature List

### Phase 1 — Core Working Bot (Build First)

- [ ] **Project scaffold** — Next.js + Tailwind + TypeScript setup
- [ ] **Persona system prompt** — `lib/persona.ts` with Dinakaran's full background, ground-truth answers, tone guidelines
- [ ] **API route** — `pages/api/chat.ts` calls Gemini API with persona + user question, returns plain text answer
- [ ] **Mic button** — Click to start listening (Web Speech API STT), auto-stops on silence
- [ ] **Bot speaks back** — Trigger `SpeechSynthesis` to read the Gemini response aloud on answer receipt
- [ ] **Question chips** — 5 pre-set clickable buttons for the 5 brief questions (no typing or mic needed)
- [ ] **Conversation history** — Show transcript of Q&A on screen for reference

### Phase 2 — Polish & UX (After Core Works)

- [ ] **Loading animation** — Visual indicator while Gemini is thinking (spinner or animated dots)
- [ ] **Mic animation** — Pulsing animation while actively listening (like voice recorder UI)
- [ ] **Error handling** — Graceful message if STT fails or Gemini API returns an error
- [ ] **Mobile responsive** — Works cleanly on mobile browser (Bhumika may test on phone)
- [ ] **Clear conversation button** — Reset the Q&A history

### Phase 3 — After Initial Implementation (Add More Questions)

- [ ] Add more interview questions to `lib/persona.ts` and update question chips
- [ ] Fine-tune answers based on what 100x values (ownership, US timezone, client-first thinking)
- [ ] Add Dinakaran's real project walkthrough question (e.g., "Tell me about a project you built")

---

## API Route Logic (`pages/api/chat.ts`)

```
INPUT:  { message: string }  ← the interviewer's question
        
PROCESS:
  1. Retrieve GEMINI_API_KEY from server env (never exposed to frontend)
  2. Build prompt = Dinakaran's system prompt + "\n\nInterviewer: " + message
  3. Call Gemini API (gemini-1.5-flash, generateContent)
  4. Extract response text
  
OUTPUT: { answer: string }   ← Dinakaran's reply
```

---

## Persona System Prompt Strategy (`lib/persona.ts`)

The system prompt will:
1. Define who Dinakaran is (education, internship, real production incidents)
2. Define tone: conversational, honest, builder-mindset, not over-formal
3. Define what NOT to do: don't make up fake experiences, don't claim skills he doesn't have, don't be robotic
4. Pre-load specific answers for the 5 seed questions from the brief
5. Handle unexpected questions gracefully (fall back to honest, genuine response)

---

## Local Testing Guide

### Step 1: Install dependencies
```bash
cd "D:\100x Assignment"
npm install
```

### Step 2: Create environment file
Create a file called `.env.local` in the root:
```
GEMINI_API_KEY=your_actual_key_here
```

### Step 3: Run locally
```bash
npm run dev
```
Open: `http://localhost:3000`

### Step 4: Test in browser
> ⚠️ Use **Google Chrome** or **Microsoft Edge** for best Web Speech API support.  
> Safari on Mac also works. Firefox has limited STT support.

1. Open `http://localhost:3000`
2. Click one of the 5 preset question chips OR click the mic button and ask a question
3. Wait 2–3 seconds for Gemini to respond
4. The bot will speak the answer aloud AND display it on screen

---

## Deployment Guide (After Local Testing is Complete)

### Step 1: Push to GitHub
Push the project to a GitHub repo (public or private).

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"** → Select your repo
3. Framework: **Next.js** (auto-detected)
4. Click **"Environment Variables"** → Add: `GEMINI_API_KEY = your_key`
5. Click **Deploy**

### Step 3: Get Your URL
Vercel gives you a live URL like:  
`https://dinakaran-voice-bot.vercel.app`

### Step 4: Submit to Bhumika
Reply to her email thread with:
- The live Vercel URL
- Your resume (already attached in original email)

---

## What NOT to Commit to GitHub

See `.gitignore` — these are excluded:
- `.env.local` (contains your Gemini API key)
- `node_modules/`
- `.next/` (build artifacts)

---

## Questions to Add After Implementation

> To be added in Phase 3 after the bot is live and tested:

1. Tell me about a project you've built from scratch.
2. What is your experience with AI/LLM APIs?
3. How do you handle production bugs or failures?
4. Can you work during US Eastern or Pacific time zone hours?
5. Why do you want to join 100x specifically?
6. What does ownership mean to you as an engineer?
7. Tell me about a time you pushed your limits technically.
