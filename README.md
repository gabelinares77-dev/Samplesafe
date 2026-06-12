# King — Daily Strength for Men of God

A mobile-first devotional app for men, built to match the black-and-white
wireframe / line-art design exactly: 2px ink outlines, hand-drawn style SVG
illustrations, pill buttons, and bold tight typography (Inter).

## Screens

- **Morning** — "You are not forgotten today." greeting with crown-over-mountains
  illustration and the Daily Verse card (Philippians 4:13) with *Read to me*.
- **Home dashboard** — Today's Focus ("Strength in Discipline", 2 of 5 tasks,
  progress bar), *Start Your Day*, quick actions (Verse / Prayer / Journal / Plan),
  and the Daily Reminder card ("Discipline today. Freedom tomorrow. Legacy forever.").
- **Audio player** — "Listening to Philippians 4:13" with cross illustration,
  seek bar (0:12 / 2:45), ±15s skip, play/pause, and *Reflect on this*.
- **Plans** — 21 Day Discipline Plan (60%) and 7 Day Gratitude Plan (0%).
- **Journal** — Mon 13 – Fri 17 date strip, "How was your walk with God today?",
  Add Photo / Save Entry.
- **Streak** — flame, 7 Day Streak, M–F filled week dots, *View Progress*.
- **Prayer** — guided prayer prompts.
- **Profile** — King avatar, Statistics / Bookmarks / Downloads /
  Push Notifications toggle / About / Sign Out.
- **About** — the five values: Faith First, Built for Men, Daily Discipline,
  God's Word, Prayer.

## Run it

No build step — it's plain HTML/CSS/JS.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` in a browser. On desktop the app renders inside a
phone frame; on a phone it fills the screen.

## Navigating

- Tap the **crown** on the morning screen to open the dashboard (and the crown
  on the dashboard to come back).
- Tap the **flame 7** pill on the dashboard to see your streak.
- *Read to me* / Verse opens the audio player; the chevron closes it.
