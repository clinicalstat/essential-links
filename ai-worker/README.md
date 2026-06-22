# AI chatbot backend (Cloudflare Worker)

This optional Worker turns the site's resource-finder into a conversational
assistant. It uses **Cloudflare Workers AI**, which has a free daily allowance,
and runs the model server-side at the edge so **no API key is ever exposed in
the page**.

How it works: the browser finds the most relevant resources from the directory
(using the existing ranker) and posts them here with the user's question. The
Worker asks a free model to write a short answer that recommends those real
resources by name, then returns it. If this endpoint is empty or unreachable,
the chat automatically falls back to the built-in rule-based finder, so the
site always works.

## One-time deploy

You need a free Cloudflare account.

1. Install the CLI (Node 18+):
   ```
   npm install -g wrangler
   ```
2. Log in:
   ```
   wrangler login
   ```
3. From this folder, deploy:
   ```
   cd ai-worker
   wrangler deploy
   ```
   Wrangler prints a URL like
   `https://essential-links-ai.<your-subdomain>.workers.dev`.

4. Put that URL into the site: open `index.html`, search for `AI_ENDPOINT`,
   and set it:
   ```js
   const AI_ENDPOINT='https://essential-links-ai.<your-subdomain>.workers.dev';
   ```
   Commit and push. The chatbot is now conversational.

## Notes / tuning

- **Allowed origin:** `worker.js` restricts calls to
  `https://clinicalstat.github.io`. Add `http://localhost:8000` (or similar)
  to `ALLOW_ORIGINS` while testing locally.
- **Model:** defaults to `@cf/meta/llama-3.1-8b-instruct`. Change `MODEL` in
  `worker.js` to any Workers AI text model.
- **Cost:** Workers AI has a free daily allowance. A busy public page can
  exhaust it; usage beyond the free tier is billed. See Cloudflare's Workers AI
  pricing for current limits.
- **Abuse protection (recommended for a public page):** add per-IP rate
  limiting or a Cloudflare Turnstile check so scrapers cannot drain the free
  allowance. Without it the bot still works, but a flood of requests could hit
  the daily cap (after which the site simply falls back to the rule-based bot).
- **Privacy:** only the user's question and the already-public resource titles
  are sent to the model. No personal data is collected or stored.

## To turn it off

Set `AI_ENDPOINT=''` in `index.html` (and optionally
`wrangler delete` the Worker). The chat reverts to the rule-based finder.
