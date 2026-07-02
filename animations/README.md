# Octopus → Box Lottie animation

`octopus-box.json` is a self-contained Lottie animation (800×600, 30 fps,
195 frames / 6.5 s): a cartoon octopus swims across an underwater scene,
pauses in front of a cardboard box, then gets sucked in — stretch, poof,
and the lid flaps snap shut.

It uses only shape layers and one precomp (no images, no fonts, no
expressions), so it works in every standard Lottie runtime.

## Preview

```bash
cd animations
python3 -m http.server 8000
# open http://localhost:8000/preview.html
```

## Usage

**Web (lottie-web):**

```js
import lottie from 'lottie-web';
lottie.loadAnimation({
  container: document.getElementById('anim'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/animations/octopus-box.json',
});
```

Also drops straight into `<lottie-player>` / `<dotlottie-player>` web
components, `lottie-react`, `lottie-ios`, and `lottie-android`.

## Timeline

| Frames  | Beat |
|---------|------|
| 0–100   | swims in from the left, tentacles undulating, bubbles rise |
| 100–112 | anticipation pause in front of the box, suction lines appear |
| 112–150 | pulled toward the box: arcs up, stretches, plunges in head-first |
| 148–166 | poof burst, box squash-and-stretch wiggle, lid flaps snap shut |
| 166–195 | settle (loops cleanly back to the swim-in) |

## Regenerating

The JSON is produced by a script — tweak timings, colors, or geometry
there and re-run:

```bash
python3 generate_octopus_lottie.py
```
