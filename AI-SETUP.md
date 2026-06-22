# Turn on the AI chatbot (free, no terminal, no credit card)

The chatbot works today as a rule-based link finder. This optional step makes it
write full conversational answers, using **Google Gemini's free tier**. Nothing
here can charge you: the Gemini free tier needs no card and just returns an error
when limits are hit, and the Vercel free plan needs no card. If a limit is ever
reached, the chat quietly falls back to the rule-based finder.

Everything below is done in your **web browser** - no terminal, no installs.

## Step 1 - Get a free Gemini key (2 min)

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account and click **Create API key**.
3. Copy the key (looks like `AIza...`). Keep it handy for Step 2.

*(No credit card. This key stays private - you paste it into Vercel's settings,
never into the website code.)*

## Step 2 - Deploy the relay on Vercel (5 min)

The relay is the small piece that holds your key privately and forwards questions
to Gemini, so the key is never visible in the public site.

1. Go to https://vercel.com and click **Sign Up** - choose **Continue with
   GitHub** (free, no card).
2. Click **Add New... -> Project**.
3. Find **essential-links** in the list and click **Import**.
4. Before clicking Deploy, open the **Environment Variables** section and add:
   - **Name:** `GEMINI_KEY`
   - **Value:** paste the key from Step 1
   Click **Add**.
5. Click **Deploy** and wait for it to finish.
6. Vercel shows your site URL, like `https://essential-links-xxxx.vercel.app`.
   Your chatbot endpoint is that URL with `/api/chat` on the end:
   ```
   https://essential-links-xxxx.vercel.app/api/chat
   ```

## Step 3 - Send me that endpoint

Paste the `.../api/chat` URL back to me and I'll switch the live chatbot on
(I set `AI_ENDPOINT` in `index.html` and push). You can also do it yourself:
search for `AI_ENDPOINT` in `index.html` and set it to that URL.

That's it. The chatbot will then answer in full sentences and still recommend the
real links from the directory.

---

### Notes
- **Which site stays live?** Your main site is still GitHub Pages
  (clinicalstat.github.io). Vercel is only used for the `/api/chat` endpoint -
  you can ignore the copy of the site Vercel also hosts.
- **Privacy:** only the user's question and already-public resource titles are
  sent to Gemini. No personal data is collected.
- **Turn it off:** set `AI_ENDPOINT=''` in `index.html`, or delete the project in
  Vercel. The chat reverts to the rule-based finder.
- **Allowed site:** `api/chat.js` only answers requests from
  `https://clinicalstat.github.io`. If your site moves, update `ALLOW_ORIGINS`
  in that file.
