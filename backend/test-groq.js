require('dotenv').config();
const axios = require('axios');

const key = process.env.GROQ_API_KEY;
console.log('🔑 GROQ_API_KEY:', key ? key.slice(0, 15) + '...[len:' + key.length + ']' : '❌ NOT SET');

const models = ['llama-3.1-8b-instant', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'];

async function testModel(model) {
  try {
    const r = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      { model, messages: [{ role: 'user', content: 'Say "hello" in one word.' }], max_tokens: 10 },
      { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    console.log(`✅ ${model}: "${r.data.choices[0].message.content.trim()}"`);
    return true;
  } catch (e) {
    console.log(`❌ ${model}: [${e.response?.status}] ${JSON.stringify(e.response?.data?.error || e.message)}`);
    return false;
  }
}

(async () => {
  for (const m of models) {
    const ok = await testModel(m);
    if (ok) { console.log('\n🎉 Working model found:', m); break; }
  }
  console.log('\nDone.');
})();
