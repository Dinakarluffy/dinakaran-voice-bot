// Standalone script to test Gemini API connectivity
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnection() {
  console.log('\n🔍 --- TESTING GEMINI API CONNECTIVITY ---');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ FAIL: GEMINI_API_KEY is not defined in .env.local');
    process.exit(1);
  }

  console.log(`🔑 Key found (length: ${apiKey.length})`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    console.log('📡 Sending test prompt to gemini-3.5-flash...');
    const startTime = Date.now();
    const result = await model.generateContent('Say hello in one short sentence!');
    const response = await result.response;
    const latency = Date.now() - startTime;

    console.log(`✅ SUCCESS (${latency}ms)!`);
    console.log(`💬 Model response: "${response.text().trim()}"`);
    console.log('\n🎉 Gemini API is working and ready to use!\n');
  } catch (error) {
    console.error('❌ ERROR connecting to Gemini API:');
    console.error(error.message || error);
    process.exit(1);
  }
}

testGeminiConnection();
