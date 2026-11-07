# 🎙️ Dinakaran S — Interactive AI Voice Twin (100x Assessment)

> 🔗 **Live Working Demo:** [https://dinakaran-voice-bot.vercel.app/](https://dinakaran-voice-bot.vercel.app/)  
> *Zero setup or API key needed. Works instantly in any browser on desktop or mobile.*

An interactive voice-powered AI Twin representing **Dinakaran S** for the AI Engineer role at **100x.inc**. 

Instead of just reading a flat resume, recruiters and engineering leads can have a real-time voice conversation with Dinakaran. You can ask him questions about his education, problem-solving skills, and real-world backend engineering work, and hear him respond aloud with natural speech.

---

## 💡 What is This? (In Simple Words)

Imagine having a digital interview with Dinakaran where:
1. **You ask a question** by speaking into your mic or tapping any question button on screen.
2. **Dinakaran speaks back to you** with a natural voice, explaining his engineering projects, algorithms, and journey.
3. **Real-time Karaoke Highlight**: As he speaks, each spoken word lights up on screen in real time so you can easily follow along.

---

## 📋 Sample Input & Output Examples

Here are real questions you can ask the bot and how Dinakaran answers:

### 1. Introduction & Background
* **Interviewer Question:** *"Please introduce yourself."*
* **Dinakaran's Voice Response:**
  > *"Good afternoon! I'm Dinakaran S, a fresh 2026 B.Tech graduate in Information and Communication Technology from SASTRA Deemed University. As a fresher, I've really focused on strengthening my computer science fundamentals—solving over 140 problems on LeetCode using C++.*  
  > *Beyond theory, I gained six months of hands-on production experience as a Software Developer Intern at IncuBrix. There, I built high-throughput backend services in Go, solved container memory crashes by implementing efficient disk streaming, and integrated AI pipelines using the Gemini API. Alongside that, I've built robust full-stack academic projects like an image encryption tool and a secure Django web platform.*  
  > *I graduated this June with all my degree credentials in hand, and as an immediate joiner with zero notice period, I am really excited to start my full-time engineering career."*

### 2. Coding & Algorithms
* **Interviewer Question:** *"What language do you use to solve DSA problems and why?"*
* **Dinakaran's Voice Response:**
  > *"I primarily use C++ for solving data structures and algorithms problems. I really appreciate C++ because of the Standard Template Library (STL), which gives me fast, pre-built containers and algorithms right out of the box. Beyond that, C++ gives me fine-grained control over memory and pointers, which forces me to understand how algorithms execute under the hood. It has been my primary language for solving over 140 problems on LeetCode and achieving a contest rating of 1507."*

### 3. Real-World Engineering & Problem Solving
* **Interviewer Question:** *"How did you fix the server memory crashes on large video files at IncuBrix?"*
* **Dinakaran's Voice Response:**
  > *"To explain it simply: imagine a kitchen with a very small prep counter. In our old code, whenever a creator uploaded a large 466-megabyte video, the server tried to dump the whole file onto the counter at once. When multiple people uploaded at the same time, the server ran out of memory and crashed.*  
  > *The fix I built works like a conveyor belt: instead of loading the entire heavy video into RAM, we stream it directly to temporary disk storage in tiny bite-sized chunks, extract the audio, and immediately wipe the temp file clean. Active memory consumption dropped by over 90% (from ~480 MB down to under 30 MB) on the exact same server without needing expensive hardware upgrades!"*

### 4. Logistics & Verification
* **Interviewer Question:** *"Are you a fresher or an experienced engineer? Are your documents ready for background check?"*
* **Dinakaran's Voice Response:**
  > *"I am a fresher and a 2026 graduate engineer from SASTRA University. My only professional experience is my 6-month Software Developer Internship at IncuBrix. All my official university documents—including degree certificate, provisional certificate, and all 8 semester marksheets—are in hand. Everything is cleared with zero backlogs, so I'm 100% ready for background verification and immediate onboarding."*

---

## 🚀 How to Try the Live Demo (3 Simple Steps)

1. Open **[https://dinakaran-voice-bot.vercel.app/](https://dinakaran-voice-bot.vercel.app/)** in Chrome, Edge, or Safari.
2. Turn on your computer or phone sound.
3. Tap the central glowing orb or click any preset question chip to start talking!

---

## 💻 How to Run Locally on Your Machine

If you want to run this project on your local computer:

### 1. Clone the repository
```bash
git clone https://github.com/Dinakarluffy/dinakaran-voice-bot.git
cd dinakaran-voice-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your Gemini API Key
Create a `.env.local` file in the root folder:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Get a free key in 30 seconds from [Google AI Studio](https://aistudio.google.com/app/apikey)).*

### 4. Run the development server
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser.

### 5. (Optional) Run CLI test scripts
```bash
# Test Gemini model connectivity
npm run test:gemini

# Test Dinakaran's persona Q&A from terminal
node scripts/test-persona.js "Please introduce yourself."
```

---

## 🛠️ Architecture & Technologies

* **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
* **Speech Synthesis & Recognition:** Browser Web Speech API (STT & TTS) with fallback cadence engine
* **AI Model:** Google Gemini (`gemini-3.5-flash-lite` with multi-model fallback cascade)
* **Hosting:** Vercel Serverless Edge

---

## 👤 Candidate Profile & Links

* **Candidate:** Dinakaran S (2026 Graduate Engineer, SASTRA Deemed University)
* **Live App:** [https://dinakaran-voice-bot.vercel.app/](https://dinakaran-voice-bot.vercel.app/)
* **GitHub:** [https://github.com/Dinakarluffy](https://github.com/Dinakarluffy)
* **LeetCode:** [https://leetcode.com/u/asta_dkn/](https://leetcode.com/u/asta_dkn/) (140+ Solved | Rating 1507)
* **LinkedIn:** [https://www.linkedin.com/in/dinakaran-s-7ab167312/](https://www.linkedin.com/in/dinakaran-s-7ab167312/)
