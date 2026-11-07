# 🎙️ Dinakaran Voice Bot — About This Project

## What Is This?

A **live, deployable voice-powered AI persona bot** that acts as **Dinakaran S** in an interview setting.

The interviewer (Bhumika / Nik Shah / anyone at 100x) opens a URL in their browser, taps a microphone button or clicks a pre-set question chip, and the bot answers **as Dinakaran would** — in real voice, conversationally, covering his background, projects, strengths, and goals.

---

## Why This Bot Exists

This is the **Stage 1 At-Home Assessment** for the **AI Engineer role at 100x.inc**.

> Brief (from Bhumika Prasad, Head of Talent @ 100x):
> "Using ChatGPT's API or any suitable free alternative, create a voice bot that answers questions as YOU would."
>
> Requirements:
> - Deploy as a web app or interactive demo that anyone can easily test, including non-technical users.
> - Must require no coding knowledge, complex installations, or manual API-key entry.
> - Submit working URL + resume within 24 hours.

---

## What the Bot Does

- Listens to the interviewer's voice question via microphone (browser-native, no install needed)
- Sends the transcribed question to Gemini API with a deeply tuned **Dinakaran persona system prompt**
- Receives a natural, conversational answer (as Dinakaran would genuinely reply)
- Reads the answer aloud back to the interviewer in Dinakaran's voice (browser TTS)
- Also shows pre-set question chips for the 5 sample questions from the brief

---

## Example Questions the Bot Handles

1. What should we know about your life story in a few sentences?
2. What's your #1 superpower?
3. What are the top 3 areas you'd like to grow in?
4. What misconception do your coworkers have about you?
5. How do you push your boundaries and limits?

> These are the seed questions from the brief. We will add more after implementation.

---

## Persona Ground Truth (Dinakaran's Real Story)

This bot is a digital twin of **Dinakaran S** — everything it says is grounded in real facts:

- B.Tech ICT graduate, SASTRA Deemed University (CGPA 7.6, Class of 2026)
- 6 months production SWE internship at IncuBrix (team of 10–15)
- Built automated AI workflows, backend microservices, and document/media pipelines using Python, Go, React, Gemini API, AWS S3
- Fixed a critical ECS Fargate OOM crash by replacing in-memory buffer with disk-streaming pipeline (RAM dropped from ~486MB to near-zero per transcription)
- Migrated Gemini transcription from Base64 `inline_data` to Google Files API — eliminated 100% 503 error rate
- 140+ LeetCode problems solved (Contest Rating: 1507)
- Hands-on AWS experience (S3, ECS Fargate, CloudWatch) from IncuBrix internship
- Available to join immediately full-time

---

## Links

- GitHub: https://github.com/Dinakarluffy
- LeetCode: https://leetcode.com/u/asta_dkn/
- LinkedIn: https://www.linkedin.com/in/dinakaran-s-7ab167312/
- Internship Certificate: https://drive.google.com/file/d/1PdD-tDhSp803TZVh82FXXmWnqMrp_qtU/view
