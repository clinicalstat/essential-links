// Cloudflare Worker: conversational backend for the Essential Links chatbot.
//
// The browser retrieves the most relevant resources from the directory and
// posts them here with the user's question. This Worker asks a free
// Workers AI model to write a short answer grounded ONLY in those resources,
// so it can recommend real links and never invent URLs. The API/model runs
// server-side at Cloudflare's edge, so there is no key to expose in the page.
//
// Deploy: see README.md in this folder.

const ALLOW_ORIGINS = [
  'https://clinicalstat.github.io'
  // add 'http://localhost:8000' etc. while testing locally
];

// Model: a capable instruct model on the Workers AI free allowance.
// Swap for another Workers AI text model if you prefer.
const MODEL = '@cf/meta/llama-3.1-8b-instruct';

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

    let answer = '';
    try {
      const out = await env.AI.run(MODEL, {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 300,
        temperature: 0.3
      });
      answer = String((out && (out.response || out.result || '')) || '').trim();
    } catch (e) {
      return json({ error: 'ai_unavailable' }, 502, origin);
    }

    if (!answer) return json({ error: 'empty_answer' }, 502, origin);
    return json({ answer }, 200, origin);
  }
};
