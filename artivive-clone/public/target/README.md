# Put your two real files here

This folder needs exactly two files for the site to work:

1. `target.mind`  — your photo, compiled into MindAR's tracking format
2. `video.mp4`    — the video that plays when the photo is detected

## How to create target.mind from your photo

You do NOT upload your raw photo (.jpg/.png) directly — MindAR needs it
pre-compiled into a `.mind` file first. This is a one-time step per photo.

**Easiest way (no install, no code):**
1. Go to: https://hiukim.github.io/mind-ar-js-doc/tools/compile/
2. Upload your photo (a clear, detailed, high-contrast image works best —
   avoid plain/blurry/symmetrical images, they track poorly)
3. Click compile, then download the resulting `target.mind` file
4. Drop it into this folder, replacing the placeholder

**Tips for a good source photo (this affects tracking quality a lot):**
- Lots of visual detail/texture (busy patterns track better than plain colors)
- Good contrast, no blur
- Avoid repeating patterns (checkerboards, plain gradients) — MindAR can't
  tell one part of the image from another in those cases

## How to add your video

Just rename your video file to `video.mp4` and drop it here.
Keep it reasonably compressed (H.264 MP4, under ~20-30MB) so it loads fast
on mobile data — large videos = long wait before the video starts playing.

If you want a different filename, update the `VIDEO_SRC` constant at the
top of `app/components/Scanner.js` to match.
