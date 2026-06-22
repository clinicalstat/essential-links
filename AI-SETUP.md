# AI chatbot backend (how it's set up)

The chatbot has two modes:

- **Rule-based finder** (always on) - matches your question against the directory
  and returns the best links. Works with no backend.
- **Conversational answers** (optional) - a small relay calls a free AI model to
  write a short answer that recommends the matched links by name.

The conversational layer is **currently enabled** via a free
[Val.town](https://val.town) HTTP function that relays to Google Gemini's free
tier. There is **no billing**: the Gemini free tier and Val.town free plan both
need no credit card, and if a limit is ever hit the chat silently falls back to
the rule-based finder.

## How it's wired

- **Frontend:** `index.html` has `const AI_ENDPOINT='https://...web.val.run'`.
  The browser finds the most relevant resources with the built-in ranker, posts
  the question + those resources to the endpoint, and shows the returned answer
  above the matched cards. Any error or empty answer -> automatic fallback to the
  rule-based finder.
- **Relay:** a Val.town HTTP val (owner `clinicalstat`, name `essentiallinksai`).
  It holds the API key as a private environment variable (`GEMINI_KEY`), builds a
  grounded prompt from the posted resources, calls Gemini, and returns
  `{ "answer": "..." }`. CORS is locked to `https://clinicalstat.github.io`.
- **Model:** `gemini-2.5-flash-lite` (free-tier eligible). Note: `gemini-2.0-flash`
  returned `limit: 0` for this project/region, so `2.5-flash-lite` is used instead.

## Maintenance

- **Change the model:** edit line 2 of the val's `main.ts`
  (`const MODEL = "..."`). `gemini-2.5-flash` is a higher-quality free option.
- **Rotate the key:** Val.town -> the val -> Env vars -> update `GEMINI_KEY`.
- **Turn the AI off:** set `AI_ENDPOINT=''` in `index.html`. The chat reverts to
  the rule-based finder; nothing else breaks.
- **If you hit 429s under heavy traffic:** the free tier has per-minute/day
  limits. The chat just falls back when they're hit; for a durable fix you can
  switch the relay to another free provider (e.g. Groq) or link billing.

## The val's code

The Val.town function source lives in the val itself
(`https://www.val.town/x/clinicalstat/essentiallinksai`). It accepts
`POST { q, items }` and returns `{ answer }`, relaying to Gemini with the key
read from `Deno.env.get("GEMINI_KEY")`.
