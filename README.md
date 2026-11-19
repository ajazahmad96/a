# AJAZ MYSTIC PORTAL 4.0
Three.js + GLSL portal. No build step: Three.js (0.160) and MediaPipe Hands load from jsDelivr, so the device needs internet.

## Run locally
    cd mystic-portal && python3 -m http.server 8080     # or: npx serve .
Open http://localhost:8080. ES modules need http(s), not file://.

## Deploy to Vercel
Push the folder to GitHub, import in Vercel (Framework: Other, no build command, output dir `.`), or run `npx vercel --prod` in the folder. Vercel serves HTTPS, which camera mode needs.

## Use
- TOUCH: drag a full circle (clockwise or anticlockwise). Ring forms with your progress; finishing triggers activation.
- CAMERA: tap TOUCH to switch; allow camera; pinch thumb+index, draw a circle in the air, keep pinching until it completes.
- ⚙: destination, size, rotation, gesture sensitivity, volume. SOUND is off until you tap it.

## Mobile testing
Camera requires HTTPS or localhost. On Android: deploy to Vercel and open the URL, or USB-debug and use chrome://inspect > Port forwarding 8080 -> localhost:8080.

## Files
js/main.js (loop, state), portal.js + portal-shaders.js (GLSL ring/vortex/Asgard), particle-system.js, gesture-engine.js, hand-tracking.js, audio-engine.js (synthesized), destinations.js, ui.js.
