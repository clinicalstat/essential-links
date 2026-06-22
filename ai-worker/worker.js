// Cloudflare Worker: conversational backend for the Essential Links chatbot.
//
// Uses Google Gemini's FREE tier (no credit card; the free tier returns errors
// when limits are hit and never bills). This Worker only RELAYS the request and
// keeps your Gemini API key as a server-side secret, so the key is never exposed
// in the static page. The Worker itself runs on Cloudflare's free Workers plan,
// which also does not bill unless you explicitly enable paid usage.
//
// The browser retrieves the most relevant resources from the directory and posts
// them here with the user's question. Gemini writes a short answer grounded ONLY
// in those resources, so it recommends real links and never invents URLs.
//
// Deploy: see README.md in this folder.

const ALLOW_ORIGINS = [
  'https://clinicalstat.github.io'
  // add 'http://localhost:8000' etc. while testing locally
];

// Free-tier Gemini model. Change if you prefer another free model.
const MODEL = 'gemini-2.0-flash';

function corsHeaders(origin) {
  const allowed = ALLOW_ORIGINS.includes(origin) ? origin : ALLOW_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'POST only' }, 405, origin);
    }
    if (!env.GEMINI_KEY) {
      return json({ error: 'missing GEMINI_KEY secret' }, 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid JSON' }, 400, origin);
    }

    const q = String(body.q || '').slice(0, 500).trim();
    const items = Array.isArray(body.items) ? body.items.slice(0, 10) : [];
    if (!q) return json({ error: 'empty query' }, 400, origin);

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

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_KEY}`;

    let answer = '';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(endpoint, {
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
      if (!res.ok) {
        // 429 = free-tier limit reached; the site falls back to the rule-based bot
        return json({ error: 'gemini_status_' + res.status }, 502, origin);
      }
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      answer = parts.map(p => p.text || '').join('').trim();
    } catch (e) {
      return json({ error: 'ai_unavailable' }, 502, origin);
    }

    if (!answer) return json({ error: 'empty_answer' }, 502, origin);
    return json({ answer }, 200, origin);
  }
};
