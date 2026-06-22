# AI chatbot backend (free, zero billing risk)

This optional backend turns the site's resource-finder into a conversational
assistant using **Google Gemini's free tier**:

- **No credit card.** The Gemini free tier requires no card and simply returns
  an error when its rate limits are hit — it can never bill you. When that
  happens, the chat automatically falls back to the built-in rule-based finder,
  so the site always works.
- **Key stays hidden.** A tiny Cloudflare Worker relays the request and holds
  your Gemini key as a server-side secret, so the key is never exposed in the
  static page. The Worker runs on Cloudflare's **free** Workers plan (no paid
  add-on, no Workers AI), which also does not bill unless you explicitly turn on
  paid usage.

How it works: the browser finds the most relevant resources from the directory
(using the existing ranker) and posts them here with the user's question. Gemini
writes a short answer that recommends those real resources by name. The model
only sees the retrieved candidates, so it cannot invent links.

## One-time setup (~5 minutes)

You need a free Google account and a free Cloudflare account.

1. **Get a free Gemini API key** (no card):
   go to https://aistudio.google.com/apikey and click **Create API key**. Copy it.

2. **Install the CLI** (Node 18+) and log in to Cloudflare:
   ```
   npm install -g wrangler
   wrangler login
   ```

3. **Deploy the Worker** from this folder:
   ```
   cd ai-worker
   wrangler deploy
   ```

4. **Store your Gemini key as a secret** (paste it when prompted):
   ```
   wrangler secret put GEMINI_KEY
   ```

5. Wrangler printed a URL like
   `https://essential-links-ai.<your-subdomain>.workers.dev`.
   Open `index.html`, search for `AI_ENDPOINT`, and set it:
   ```js
   const AI_ENDPOINT='https://essential-links-ai.<your-subdomain>.workers.dev';
   ```
   Commit and push. The chatbot is now conversational. (Send the URL and I can
   do this last step for you.)

## Notes

- **Allowed origin:** `worker.js` restricts calls to
  `https://clinicalstat.github.io`. Add `http://localhost:8000` (or similar) to
  `ALLOW_ORIGINS` while testing locally.
- **Model:** defaults to `gemini-2.0-flash` (free tier). Change `MODEL` in
  `worker.js` for another free Gemini model.
- **Free-tier limits:** Gemini's free tier has per-minute and per-day request
  limits shared across all site visitors. When a limit is reached, requests
  return an error and the site falls back to the rule-based bot — nothing
  breaks, and nothing is charged.
- **Privacy:** only the user's question and already-public resource titles are
  sent to the model. No personal data is collected or stored.

## To turn it off

Set `AI_ENDPOINT=''` in `index.html` (and optionally `wrangler delete`). The
chat reverts to the rule-based finder.
