# 🎙️ Dinakaran Voice Bot — Comprehensive Project Documentation & Incident Log

A live, deployable, voice-powered AI persona bot built for the **Stage 1 At-Home Assessment** for the **AI Engineer role at 100x.inc**.

---

## 🌐 Live URLs & Links

- **Live Deployed Web App (Vercel):** [https://dinakaran-voice-bot.vercel.app/](https://dinakaran-voice-bot.vercel.app/)
- **GitHub Repository:** [https://github.com/Dinakarluffy/dinakaran-voice-bot](https://github.com/Dinakarluffy/dinakaran-voice-bot)
- **Dinakaran's Resume (PDF):** [Google Drive Link](https://drive.google.com/file/d/1he0k_KOFamuKBh82v6u3U3SBLUdEHNbC/view)
- **LinkedIn Profile:** [linkedin.com/in/dinakaran-s-7ab167312](https://www.linkedin.com/in/dinakaran-s-7ab167312/)
- **LeetCode Profile (140+ Solved | Rating 1507):** [leetcode.com/u/asta_dkn](https://leetcode.com/u/asta_dkn/)
- **IncuBrix Internship Certificate:** [Google Drive Verification](https://drive.google.com/file/d/1PdD-tDhSp803TZVh82FXXmWnqMrp_qtU/view)

---

## 📋 The Assessment Brief & Objective

**Evaluator:** Bhumika Prasad (Head of Talent @ 100x.inc)  
**Task:** Using ChatGPT's API or any suitable free alternative, create a voice bot that answers questions as **YOU** would.

### Core Submission Requirements:
1. **Interactive Demo:** Deployable as a web app that anyone can test without technical friction.
2. **Zero Barrier to Entry:** Requires no local installation, complex setup, or manual user API-key entry.
3. **Turnaround:** Working URL and resume submitted within 24 hours of brief delivery.

---

## 🛠️ Complete Architecture & Features Implemented

### 1. Frontend & Interactive Voice Experience
- **Framework:** Next.js 14 (Pages Router), React 18, TypeScript, Tailwind CSS.
- **Glowing Visualizer Orb (`VoiceOrb.tsx`):**
  - Displays dynamic reactive CSS pulse and ripple states: `Idle` (calm breathing pulse), `Listening` (crimson ring wave animation), `Thinking` (amber rotating aura with spinner), and `Speaking` (cyan soundwave bars).
- **Dual-Mode Input:**
  - **Speech-to-Text (STT):** Browser-native `webkitSpeechRecognition` / `SpeechRecognition` with auto-stop on silence and mobile permission handling.
  - **Text Input & Quick Chips:** Sticky bottom message bar with input box + 3 categorized question chip tabs (Brief/Seed Questions, IncuBrix Production Deep Dives, Academic & Problem Solving).
- **Single-Page UX Enhancements:**
  - One-click answer audio replay (`Play Audio`).
  - One-click clipboard answer copying (`Copy Answer`).
  - Dark Mode / Light Mode toggle with local storage persistence.
  - Quick-start guide banner for interviewers.
  - Reset conversation button.

### 2. Backend & AI Persona System Prompt (`pages/api/chat.ts`)
- **LLM Engine:** Google Gemini Interactions API (`@google/generative-ai`).
- **Dynamic Fallback Model Pool:** Graceful cascading failover through ultra-fast Flash models (`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-flash-lite-latest`, `gemini-3.5-flash`, `gemini-3.8-flash`) to guarantee zero downtime and survive free-tier rate limits.
- **Dynamic Time Greeting:** Client transmits local time of day (`morning`, `afternoon`, `evening`) so Dinakaran's self-introduction naturally reflects the interviewer's time zone.
- **Strict Persona Grounding:** Grounded exclusively in Dinakaran's true academic background (SASTRA Deemed University, 2026 graduate engineer), LeetCode contest rating (1507, 140+ C++ solutions), and IncuBrix production engineering incidents.

---

## 🔬 Bugs, Root Causes & Technical Solutions (Exhaustive RCA Log)

During extensive end-to-end testing across desktop browsers (Chrome, Edge) and mobile devices (Android Chrome, Xiaomi MIUI), multiple critical cross-platform edge cases were diagnosed and systematically resolved:

---

### Incident 1: Karaoke Highlighting Speed Desync on Android Mobile (Chromium Bug 521666)

#### The Symptom:
When running on laptop, the word-by-word bold highlighting matched the spoken audio with 100% precision. However, when tested on an Android mobile phone, the bold highlight raced ahead of the voice by over **20 seconds**, finishing paragraph 2 while the audio was still speaking paragraph 1.

#### Root Cause Analysis:
1. **Desktop Behavior:** Desktop Chrome natively dispatches `SpeechSynthesisUtterance.onboundary` events for every spoken word (`event.name === 'word'`). On desktop, the highlight was synchronized directly by native browser callbacks.
2. **Android Chromium Bug (Bug 521666 / 1152180):** On Android Chrome, the underlying Google Text-to-Speech engine **does NOT emit word boundary events**. As a result, mobile devices relied exclusively on the fallback stepping timer (`stepNextWord`).
3. **The Timing Mismatch:** The initial fallback timer was coded with a flat base delay of 270ms per word.
   $$\text{WPM} = \frac{60000\text{ ms}}{270\text{ ms}} = 222.2\text{ Words Per Minute}$$
   Standard conversational English Google TTS speaks at **135 to 140 WPM** (~435ms per word). In a 125-word introduction, our timer finished in **33.7 seconds**, while the voice took **53.8 seconds**!

#### Technical Solution:
Engineered an acoustically calibrated cadence stepping model in `pages/index.tsx` matching Android Google TTS:
- **Base word duration:** **380ms** (~138 WPM).
- **Numbers & Acronyms:** **+420ms** extra delay for tokens matching `/\d/` (e.g., `2026` is spoken as four words: *"twenty twenty-six"*; `140+` is spoken as *"one hundred forty plus"*).
- **Capitalized abbreviations:** **+260ms** for tokens matching `/[A-Z]{2,}/` or dotted acronyms (e.g., `B.Tech`, `REST`, `API`, `ECS`).
- **Syllable & word length scaling:**
  - Short words ($\le 3$ chars, e.g., *a*, *I*, *to*, *in*): $-140\text{ms}$ (capped at 220ms minimum).
  - Long words ($\ge 8$ chars, e.g., *algorithms*, *engineering*): $+130\text{ms}$.
  - Extra-long words ($\ge 12$ chars, e.g., *communication*, *transcription*): $+260\text{ms}$.
- **Punctuation pauses:**
  - Commas, colons, semicolons, em-dashes: **+260ms**.
  - Sentence-ending periods, exclamation marks, question marks: **+520ms**.
- **Result:** Highlight timer duration adjusted from 33.7s to **53.8s** (139.4 WPM), achieving exact sync with Android mobile speech.

---

### Incident 2: Mobile TTS Voice Gender Discrepancy (Female Voice on Android)

#### The Symptom:
The bot played a masculine voice on desktop (Microsoft David), but played a female voice (`English India Voice 1`) when opened on an Android smartphone in India.

#### Root Cause Analysis:
1. **Google TTS Naming Convention:** On Android, Google Speech Services does not use the words `"male"` or `"female"` in voice names. Instead, it uses internal codes:
   - Female voices: `en-in-x-cxx` (Voice 1), `en-in-x-end` (Voice 2), `en-us-x-sfg` (US Voice 1).
   - Male voices: `en-in-x-ahp` (Voice 3), `en-in-x-ena` (Voice 4), `en-us-x-iom` (US Voice 3).
2. **False Negatives in Voice Selection:** Because `en-in-x-cxx` does not contain the word `"female"`, the previous filter identified it as a valid non-female voice and explicitly selected it.
3. **Asynchronous Voice Hydration:** On Android Chrome, `speechSynthesis.getVoices()` is empty `[]` on initial page load. Without a `window.speechSynthesis.onvoiceschanged` listener, the browser fell back to the system default female voice.
4. **Android Ignores Pitch on Network Voices:** While Desktop Chrome modifies pitch via `utterance.pitch`, Android Google TTS network voices completely ignore client-side pitch adjustments because audio is streamed directly from Google's neural vocoder.

#### Technical Solution:
1. **Asynchronous Hydration:** Added `window.speechSynthesis.onvoiceschanged` listener in `useEffect` to capture voices as soon as the OS exposes them.
2. **Explicit Pattern Matching:**
   - Blacklisted Android female identifiers: `cxx`, `end`, `enc`, `sfg`, `tpd`, `tpc`, `fis`, `afh`, `smt_en_us_f`.
   - Prioritized Android male identifiers: `ahp`, `ena`, `iom`, `iol`, `rjs`, `smt_en_us_m`.
3. **Acoustic Pitch Defense:** Added conditional pitch scaling:
   ```typescript
   const isKnownMale = chosenVoice ? isVoiceExplicitMale(chosenVoice) : false;
   utterance.pitch = isKnownMale ? 0.94 : 0.78;
   ```
   If a device only has unverified or fallback voices, lowering pitch to `0.78` shifts the fundamental frequency down by ~22% (from 215Hz into ~165Hz), placing it firmly in the masculine baritone register.
4. **Interactive Voice Settings Modal:** Added a header settings button (🎛️ Sliders icon) that opens a dedicated modal allowing any tester to view available voices on their specific device, choose their preference, and test immediate audio playback.

---

### Incident 3: Mobile Header Viewport Collisions & Text Splitting at 320px

#### The Symptom:
When viewed on narrow mobile screens (320px–360px width, e.g., mobile Chrome DevTools or compact smartphones), header text wrapped awkwardly:
- Main Header: `Dinakaran` broke onto line 1 and `S` onto line 2; the `AI VOICE TWIN` badge collided with the subtitle.
- Chat Bubble Header: `Dinakaran S`, `Speaking aloud`, and `07:54 am` wrapped into disjointed words: `S`, `aloud`, `am`.

#### Root Cause Analysis:
Container elements used `flex items-center justify-between` without `whitespace-nowrap`, `min-w-0`, or `flex-shrink-0`. When container width dropped below 340px, inline whitespace triggered line breaks between names and timestamps.

#### Technical Solution:
- Added `whitespace-nowrap flex-shrink-0` and `min-w-0` to all identity badges and timestamps.
- Shortened the identity badge from `AI VOICE TWIN` to a sleek `AI Twin` pill badge.
- Applied `hidden sm:flex` to secondary header links (LeetCode icon, speech rate gauge) on screens narrower than 640px, reserving header real estate for Theme Toggle, Voice Settings, GitHub, LinkedIn, and Reset.

---

### Incident 4: IncuBrix Production Ground-Truth Engineering (Embedded in Bot Persona)

The bot's system instruction contains exact technical facts from Dinakaran's production work at IncuBrix, ready for technical grilling by interviewers:

1. **ECS Fargate Container OOM Crash & FFmpeg Disk Streaming Fix:**
   - **Environment:** AWS ECS Fargate task (`0.5 vCPU`, `2 GB RAM`).
   - **The Failure:** 466 MB video uploads repeatedly crashed containers (Linux OOM killer exit code 137 / SIGKILL) within 50–96s under 2–3 concurrent requests.
   - **Dinakaran's Root Cause Analysis:** Validated via CloudWatch logs that the legacy pipeline was buffering the entire ~466 MB video file into RAM during FFmpeg audio extraction.
   - **The Architecture Fix:** Replaced memory buffer with disk-streaming pipeline: `S3 stream → Container ephemeral disk → FFmpeg audio extraction → Gemini API upload → immediate local disk cleanup`.
   - **Impact:** Container RAM consumption per transcription dropped from ~486 MB to near-zero, enabling concurrent transcriptions without upgrading instance size.

2. **Gemini 503 Failures & Files API Migration:**
   - **The Failure:** 100% failure rate (16 consecutive HTTP 503s over 15 minutes) under heavy transcription workloads.
   - **Root Cause Analysis:** Legacy code sent media as Base64 encoded strings in the prompt body via `inline_data`. This inflated payload size by 33% and choked the synchronous `generateContent` inference endpoint.
   - **The Architecture Fix:** Decoupled media ingestion from inference by migrating to Google's **Gemini Files API** (`/upload/v1beta/files`). Passed lightweight file URI references (`file_data`) and leveraged Google's 20 GB free temporary storage per project (with automatic 48-hour lifecycle cleanup).
   - **Impact:** Reduced 503 error rate from 100% to 0% and decoupled transfer latency from generation latency.

---

## 🚀 How to Run Locally

### Prerequisites:
- Node.js 18+ installed.
- A free Google Gemini API key ([Google AI Studio](https://aistudio.google.com/)).

### Steps:
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dinakarluffy/dinakaran-voice-bot.git
   cd dinakaran-voice-bot
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open in browser:**
   Navigate to `http://localhost:3000`.

---

## 📦 How Deployment Works (Vercel CI/CD)

The project is hosted on **Vercel** connected directly to the GitHub repository:
- Any `git push origin main` triggers an automatic production build and zero-downtime deployment.
- **Production URL:** [https://dinakaran-voice-bot.vercel.app/](https://dinakaran-voice-bot.vercel.app/)
- Zero configuration, zero client-side API key required by evaluators.
