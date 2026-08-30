# Launching Ethio Tefetagn on the internet

I can't buy a domain or click through Render/Netlify's signup on your behalf — those need your name, payment details, and account logins. What I *can* do is get everything code-side ready so each step below is just filling in a form. Follow them in order; each one takes 10–20 minutes.

**Total cost**: roughly $10–15/year for the domain. Hosting below uses free tiers, which is enough to launch and see real usage before you need to pay for anything else.

---

## Step 0 — What you'll end up with

- `ethiotefetagn.com` (or whatever you pick) → the website, hosted free on Netlify
- `api.ethiotefetagn.com` → the backend, hosted free on Render
- Both connected with HTTPS automatically, no extra setup

---

## Step 1 — Put the code on GitHub

Everything needs to live in a Git repository so Netlify/Render can deploy from it.

1. Create a free account at [github.com](https://github.com) if you don't have one.
2. Create a new **empty** repository (no README, no .gitignore — this project already has one) named `ethiotefetagn`.
3. On your own computer, inside this project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/ethiotefetagn.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` with your actual GitHub username. GitHub will prompt you to sign in the first time you push.)

Note: the `.gitignore` in this project excludes `Books/**/*.pdf` by default — large textbook files are usually better hosted elsewhere (see the note at the end of this guide) rather than committed to Git. If you'd rather commit them directly, delete that line from `.gitignore` first.

---

## Step 2 — Buy a domain

Any registrar works — a few common ones: [Namecheap](https://www.namecheap.com), [Google Domains/Squarespace Domains](https://domains.squarespace.com), [GoDaddy](https://www.godaddy.com). Search for your preferred name (e.g. `ethiotefetagn.com`) and buy it — typically $10–15/year for a `.com`.

You don't need any hosting add-ons from the registrar — just the domain itself. Skip anything they try to upsell you (website builder, email hosting, etc.) unless you want it separately.

---

## Step 3 — Deploy the backend to Render

1. Create a free account at [render.com](https://render.com) and connect your GitHub account.
2. Click **New +** → **Web Service**, and pick your `ethiotefetagn` repository.
3. Render should detect `render.yaml` in the repo root and offer to use it (click **Apply**). If it doesn't detect it automatically, set these fields manually:
   - **Root directory**: `server`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
4. Under **Environment**, add these variables:
   - `ANTHROPIC_API_KEY` — your key from [console.anthropic.com](https://console.anthropic.com)
   - `ALLOWED_ORIGINS` — for now, put `*` (you'll tighten this in Step 6 once you know your final domain)
5. Click **Create Web Service**. After a couple of minutes you'll get a URL like `https://ethiotefetagn-api.onrender.com` — that's your backend, live.
6. Test it by visiting `https://ethiotefetagn-api.onrender.com/api/health` in a browser — you should see `{"status":"ok", ...}`.

**Important limitation on Render's free tier**: the filesystem is *ephemeral* — anything written after deploy (the visitor counter file, indexed textbook JSON) is wiped whenever the service restarts or redeploys, which happens periodically on the free tier. This means:
- The visitor count will occasionally reset to 0.
- You'll need to re-run `npm run ingest` (via Render's shell, or by re-deploying after committing the generated JSON) after a restart wipes it.

This is fine for launching and testing. Once you have real traffic and want the counter and indexed books to persist permanently, either upgrade to a Render plan with a persistent disk, or move the counter to a small managed database (e.g. a free tier of Postgres, Supabase, or similar) — ask me and I'll wire that up when you're ready.

---

## Step 4 — Deploy the frontend to Netlify

1. Create a free account at [netlify.com](https://netlify.com) and connect GitHub.
2. Click **Add new site** → **Import an existing project**, pick your `ethiotefetagn` repository.
3. Netlify should detect `netlify.toml` and pre-fill:
   - **Publish directory**: `public`
   - **Build command**: (leave empty)
4. Click **Deploy**. You'll get a URL like `https://random-name-123.netlify.app` — the live site, immediately.

---

## Step 5 — Point your custom domain at both

**Frontend (Netlify):**
1. In Netlify, go to your site → **Domain settings** → **Add a custom domain**, enter `ethiotefetagn.com`.
2. Netlify will show you DNS records to add. Usually:
   - An **A record** for `@` pointing to Netlify's load balancer IP (Netlify shows the exact IP)
   - A **CNAME record** for `www` pointing to your Netlify site's `.netlify.app` address
3. Go to your domain registrar's DNS settings and add those records.
4. HTTPS is issued automatically by Netlify once DNS propagates (can take a few minutes to a few hours).

**Backend (Render):**
1. In Render, go to your web service → **Settings** → **Custom Domain**, enter `api.ethiotefetagn.com`.
2. Render will show you a CNAME record to add.
3. Add that CNAME in your registrar's DNS settings.
4. HTTPS is again automatic.

---

## Step 6 — Connect frontend to backend and lock down CORS

1. Open `public/js/config.js` in your repo and set:
   ```js
   const PRODUCTION_API_BASE = "https://api.ethiotefetagn.com";
   ```
2. Back in Render, update the `ALLOWED_ORIGINS` environment variable from `*` to your real domain(s):
   ```
   https://ethiotefetagn.com,https://www.ethiotefetagn.com
   ```
3. Commit and push the `config.js` change:
   ```bash
   git add public/js/config.js
   git commit -m "Point frontend at production backend"
   git push
   ```
   Netlify auto-redeploys on every push to `main`. Render auto-redeploys too once you save the environment variable.

---

## Step 7 — Test everything live

- Visit `https://ethiotefetagn.com` — quizzes should work immediately (they don't need the backend).
- Check the visitor counter increments on the home page.
- Try the AI Study Assistant — ask a question, confirm you get a real reply.
- Check the Library page shows your uploaded textbook status.
- Open the site on a phone to check the mobile layout and dark mode toggle.

---

## Ongoing: adding textbooks after launch

Once live, add books by:
```bash
# add PDFs into Books/<Subject> Grade <N> Textbook/ locally, then:
git add Books/
git commit -m "Add Grade 11 Biology textbook"
git push
```
Then, on Render, open a shell for your service (Render dashboard → your service → **Shell**) and run:
```bash
npm run ingest
```
Since Render's free tier filesystem is ephemeral (see Step 3), you'll need to re-run `npm run ingest` after every redeploy until you upgrade to persistent storage — tell me when you're at that point and I'll help set it up so books stay indexed permanently.

---

## If something doesn't work

- **CORS errors in the browser console**: double check `ALLOWED_ORIGINS` on Render exactly matches your frontend's URL (including `https://`, no trailing slash).
- **Chatbot says the AI isn't configured**: `ANTHROPIC_API_KEY` is missing or invalid on Render — check **Environment** there.
- **Visitor count stuck or reset**: expected on Render's free tier (see Step 3) — not a bug.
- **DNS not resolving yet**: can take up to 24–48 hours in rare cases, though usually much faster; use [dnschecker.org](https://dnschecker.org) to see propagation status.

Tell me what you're seeing at any step and I'll help you debug it.
