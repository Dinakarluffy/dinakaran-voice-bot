# 🎙️ Dinakaran S — AI Voice Persona (100x Stage 1 Assessment)

An interactive, voice-powered AI digital twin representing **Dinakaran S** for the AI Engineer role at **100x.inc**.

Interviewers can speak directly into their microphone or click preset questions to hear Dinakaran respond in real-time with his background, technical deep-dives (IncuBrix SWE internship, ECS Fargate debugging, Gemini streaming pipelines), and work philosophy.

---

## 🚀 Live Demo Requirements (Interviewer Friendly)
- ✅ **Zero Installation / Setup:** No Node.js or terminal required for testers.
- ✅ **Zero Manual API Key Entry:** Gemini API key is securely managed on the backend.
- ✅ **1-Click Testing:** Interactive voice orb + one-click preset chips for all 5 assessment questions.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (TypeScript) |
| **Styling** | Tailwind CSS (Dark futuristic voice visualizer UI) |
| **LLM Engine** | Google Gemini (`gemini-1.5-flash`) via `@google/generative-ai` |
| **Speech-to-Text (STT)** | Browser Web Speech Recognition API |
| **Text-to-Speech (TTS)** | Browser SpeechSynthesis API (Natural voice output) |
| **Deployment** | Vercel Serverless |

---

## 🧪 Local Testing & Verification

### 1. Configure Your Gemini API Key
Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey) if needed)*

### 2. Run Test Scripts
Verify the model connection and persona response directly from the CLI:

```bash
# Test 1: Verify Gemini API key & model connectivity
npm run test:gemini

# Test 2: Verify Dinakaran persona Q&A response
node scripts/test-persona.js
```

### 3. Start the Web App
```bash
npm run dev
```
Open **`http://localhost:3000`** in Google Chrome, Microsoft Edge, or Safari.

---

## 📁 Key Files

- `lib/persona.ts`: Dinakaran's ground-truth background, IncuBrix production incidents, and answer guidelines.
- `lib/questions.ts`: Preset question categories and prompt labels (easy to add/modify questions).
- `pages/api/chat.ts`: Serverless backend endpoint that securely invokes the Gemini API.
- `components/VoiceOrb.tsx`: Visual voice visualizer reacting to `idle`, `listening`, `thinking`, and `speaking` states.
- `components/QuestionChips.tsx`: 1-click question chips for the 5 Stage 1 brief questions.
- `components/Transcript.tsx`: Complete conversation transcript with audio replay and copy buttons.

---

## 🌐 Deploy to Vercel (2-Minute Guide)

1. Push this folder to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. Under **Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
5. Click **Deploy**.
6. Submit the generated `https://your-project.vercel.app` URL to Bhumika!
