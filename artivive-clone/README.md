# Scan-to-Watch (Artivive-style, one photo → one video)

Point a phone camera at a specific printed/displayed photo → the site
recognizes it → a video plays full-screen. No app install, just a website
link or QR code that opens it.

## How it works (the short version)

1. Your photo gets pre-processed once into a `target.mind` file — a map of
   visual features MindAR.js uses to recognize that exact photo through a
   camera.
2. The website opens the phone's camera and continuously checks the live
   feed against `target.mind`.
3. The moment it recognizes the photo, the camera view is swapped out for
   your video, played full-screen.
4. When the video ends (or the user taps "Scan again"), it goes back to
   scanning.

Everything runs **in the browser** — no native app, no app-store
submission, just a normal webpage.

## Project structure

```
app/
  layout.js              ← page shell, mobile viewport settings
  page.js                ← entry point (server component)
  components/
    ScannerLoader.js      ← loads Scanner client-side only (camera needs browser)
    Scanner.js            ← all the actual camera/AR/video logic lives here
public/
  target/
    target.mind          ← YOUR compiled photo target (replace the placeholder)
    video.mp4            ← YOUR video (replace the placeholder)
    README.md            ← instructions for generating target.mind
```

## Before you deploy: add your real files

Read `public/target/README.md` — it walks through compiling your photo
into `target.mind` using MindAR's free online compiler (no install needed)
and dropping your video in as `video.mp4`.

**This part is required.** The site won't recognize anything until you
swap in your own `target.mind` and `video.mp4`.

## Running it locally first

```bash
npm install
npm run dev
```

Camera access requires HTTPS in most browsers — `localhost` is allowed as
an exception, so `http://localhost:3000` will work for testing on your
computer. To test on your **phone** before deploying, you'll need either:
- a tunnel tool like `ngrok` (gives you a temporary HTTPS URL), or
- just deploy to Vercel directly (next section) — it's actually faster

## Deploying to Vercel (step by step)

### 1. Push this project to GitHub
```bash
git init
git add .
git commit -m "initial commit"
```
Create a new empty repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Import into Vercel
- Go to vercel.com → "Add New Project" → "Import Git Repository"
- Select your repo
- Framework preset will auto-detect as Next.js — leave defaults as-is
- Click **Deploy**

That's it for the app itself — no environment variables or extra config
needed for the one-photo setup, since the video and target file are just
static files in `public/`.

### 3. (Only if your video is large) — move it off `public/`

Files in `public/` get bundled into your deployment, and Vercel's deploy
size limits get tight with big video files. For a single video under
roughly 20-30MB, keeping it in `public/target/video.mp4` like this project
already does is simplest and totally fine.

If your video is large (50MB+), upload it to **Vercel Blob** instead and
point `VIDEO_SRC` in `Scanner.js` at the Blob URL it gives you:
```bash
npm i @vercel/blob
```
Then use Vercel's dashboard → Storage → Blob → upload the file directly
(no code needed for a single static file), copy the public URL it gives
you, and paste it into `VIDEO_SRC` in `app/components/Scanner.js`.

### 4. Connect your own domain

You can buy a domain from **any** registrar — Namecheap, GoDaddy,
Hostinger, etc. There's no requirement to buy it through Vercel.

Once you have a domain:
1. In your Vercel project → Settings → Domains → add your domain
2. Vercel shows you DNS records to add (usually an A record for the root
   domain, or a CNAME if you're using a subdomain like `scan.yoursite.com`)
3. Go to your registrar's DNS settings and add those exact records
4. Wait for DNS to propagate (usually minutes, sometimes up to a few
   hours) — Vercel's dashboard will show a green checkmark once it's live

## Testing the real thing

1. Print the photo (or display it on a second screen/poster) at a decent
   size — bigger and higher quality prints track more reliably
2. Open your deployed site on a phone
3. Allow camera access when prompted
4. Point the camera at the printed photo
5. Video should appear full-screen within a second or two of a steady,
   well-lit shot

## If tracking feels unreliable

- Good lighting matters a lot — avoid glare on the printed photo
- Hold the phone steady for a second; MindAR needs a few consistent frames
- A photo with lots of distinct visual detail tracks far better than a
  plain, blurry, or symmetrical one — if tracking is flaky, try
  re-compiling with a higher-detail crop of the photo
- Make sure you're testing in a real mobile browser (Safari on iOS,
  Chrome on Android) — camera AR will not work in most in-app browsers
  (e.g. opening the link inside Instagram's built-in browser can be
  unreliable; "open in Safari/Chrome" works best)

## Extending later (multiple photo→video pairs)

This version is intentionally just one pair. If you later want several
photos each triggering their own video, the cleanest path is:
- An admin upload page (photo + video pair)
- A small database table linking each photo's `.mind` file to its video
- MindAR supports multi-target tracking in one scene, so the same camera
  page can recognize several different photos and play the right video
  for whichever one it sees

Happy to build that version when you're ready — just ask.
