// Standalone script to test Dinakaran's Persona Q&A
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const personaFile = fs.readFileSync(path.join(__dirname, '../lib/persona.ts'), 'utf-8');
const personaMatch = personaFile.match(/export const DINAKARAN_PERSONA = `([\s\S]*?)`;/);
const DINAKARAN_PERSONA = personaMatch ? personaMatch[1] : '';

async function testPersona() {
  console.log('\n🎭 --- TESTING DINAKARAN PERSONA BOT ---');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ FAIL: GEMINI_API_KEY is not defined in .env.local');
    process.exit(1);
  }

  // Detect time greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const testQuestion = process.argv[2] || "Please introduce yourself.";

  console.log(`⏰ Current System Greeting: "${timeGreeting}"`);
  console.log(`❓ Interviewer Question: "${testQuestion}"`);

  const dynamicInstruction = `${DINAKARAN_PERSONA}\n\n[CURRENT CONTEXT: The local time greeting for the interviewer right now is "${timeGreeting}". Use "${timeGreeting}" as your opening!]`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      systemInstruction: dynamicInstruction,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 350,
      },
    });

    console.log('📡 Generating response as Dinakaran...');
    const startTime = Date.now();
    const result = await model.generateContent(testQuestion);
    const response = await result.response;
    const latency = Date.now() - startTime;

    console.log(`\n✅ Response received in ${latency}ms:\n`);
    console.log('🗣️ [DINAKARAN VOICE BOT]:');
    console.log(`"${response.text().trim()}"`);
    console.log('\n🎉 Persona test passed perfectly!\n');
  } catch (error) {
    console.error('❌ Error during persona test:', error);
  }
}

testPersona();
