# STARK GESTURE INTERFACE — THE FUTURE IS TOUCHLESS.
Browser hand-gesture control using MediaPipe Hand Landmarker (21 landmarks/hand). Vanilla JS ES modules; video is processed locally and never uploaded.

## Run locally
Camera needs HTTPS or localhost; ES modules need a server (not file://).
`cd STARK-GESTURE-INTERFACE && python3 -m http.server 8000` then open http://localhost:8000
First load needs internet (MediaPipe WASM from jsDelivr, model from storage.googleapis.com).

## Deploy (Vercel)
Push the folder to GitHub, import in Vercel, Framework: Other, no build command, output root. vercel.json allows camera.

## Gestures
| Gesture | Action |
|---|---|
| Index only | Move cursor |
| Thumb-index pinch | Click button / grab and drag orb / scroll in scroll area |
| Two fingers (index+middle) | Next panel/slide (configurable) |
| Fist | Configurable (default: pause) |
| Open palm held ~1 s | Pause / resume |
| Fast horizontal palm swipe | Left = next, right = previous |
Safety: hold time, per-gesture cooldown, pinch hysteresis, ⏸ PAUSE and 🔒 LOCK buttons.

## Calibration
Calibration tab: point at top-left then bottom-right of comfortable reach, holding still ~1 s each.

## Known limitations
- Controls elements inside the page only, not the OS mouse.
- Three.js 3D elements were not included (optional in the spec).
- Model and WASM load from CDNs (not bundled); versions pinned in js/hand-tracker.js.
- Left/Right hand filter depends on MediaPipe's handedness label on un-mirrored video; verify and swap if reversed.
- Cursor position shifts slightly during pinch; swipe vs palm-pause thresholds may need tuning per room.

## Manual testing checklist
[ ] camera starts and indicator shows [ ] feed and 21 landmarks draw [ ] cursor tracks index tip, not inverted [ ] pinch clicks buttons once per pinch [ ] pinch-drag orbs into drop zone [ ] pinch-scroll text area [ ] two-finger and swipe navigate [ ] palm hold and PAUSE button work [ ] stop/restart camera [ ] FPS and inference values update [ ] camera select [ ] no console errors [ ] works on the Vercel URL
