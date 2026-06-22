// Vercel serverless function: conversational backend for the Essential Links chatbot.
//
// Uses Google Gemini's FREE tier (no credit card; the free tier returns errors
// when limits are hit and never bills). This function only RELAYS the request and
// reads the Gemini API key from a Vercel Environment Variable (GEMINI_KEY), so the
// key is never exposed in the static page or committed to the repo.
//
// The browser retrieves the most relevant resources from the directory and posts
// them here with the user's question. Gemini writes a short answer grounded ONLY
// in those resources, so it recommends real links and never invents URLs.
//
// Deploy: see AI-SETUP.md in the repo root (all from the browser, no terminal).

const ALLOW_ORIGINS = [
  'https://clinicalstat.github.io'
  // add 'http://localhost:8000' etc. while testing locally
];

// Free-tier Gemini model. Change if you prefer another free model.
const MODEL = 'gemini-2.0-flash';

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ALLOW_ORIGINS.includes(origin) ? origin : ALLOW_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!process.env.GEMINI_KEY) { res.status(500).json({ error: 'missing GEMINI_KEY env var' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const q = String(body.q || '').slice(0, 500).trim();
  const items = Array.isArray(body.items) ? body.items.slice(0, 10) : [];
  if (!q) { res.status(400).json({ error: 'empty query' }); return; }

  const list = items
    .map((it, i) => `${i + 1}. ${String(it.t || '').slice(0, 120)} [${String(it.s || '')}] - ${String(it.d || '').slice(0, 200)}`)
    .join('\n')
    .slice(0, 4000);

  const system =
    'You are the resource assistant for "Essential Links for Statistical Programmers", a curated directory for clinical statistical programmers ' +
    '(CDISC, SDTM/ADaM, regulatory submissions, SAS, R, statistics). ' +
    'You are given the user question and a numbered list of candidate resources already retrieved from the directory (title, section, description). ' +
    'Write a concise, helpful reply in plain text (2 to 4 sentences, no markdown headings, no bullet symbols) that directly answers the question and ' +
    'recommends the most relevant resources BY TITLE from the list. Only reference resources from the list; never invent resources or URLs. ' +
    'If none of the candidates fit the question, say so briefly and suggest a better search term.';

  const user = `Question: ${q}\n\nCandidate resources:\n${list || '(none found)'}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_KEY}`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.3 }
      })
    });
    clearTimeout(timer);
    if (!r.ok) {
      // 429 = free-tier limit reached; the site falls back to the rule-based bot
      res.status(502).json({ error: 'gemini_status_' + r.status });
      return;
    }
    const data = await r.json();
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content
      ? data.candidates[0].content.parts || [] : [];
    const answer = parts.map(p => p.text || '').join('').trim();
    if (!answer) { res.status(502).json({ error: 'empty_answer' }); return; }
    res.status(200).json({ answer });
  } catch (e) {
    res.status(502).json({ error: 'ai_unavailable' });
  }
}
