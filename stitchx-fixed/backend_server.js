// backend_server.js — stitchX Radio API
// Deploy target: Railway (https://stitchxradio-production.up.railway.app)
//
// Fixes vs. the original:
//   1. Added the missing `})` that closed app.listen(...) — the file would
//      throw a SyntaxError on boot otherwise.
//   2. Added /now-playing endpoint (frontend radio-player.tsx polls it
//      every 10s; returning 404 made the UI flash "Tune in to the
//      underground" forever).
//   3. raceState is now actually mutated over time so /insights produces
//      changing output. Previously every field was constant, so the
//      frontend "live" display never changed.

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// --- Race state (mutated by the simulation loop below) ---
let raceState = {
  gap: 90,               // seconds between breakaway and peloton
  avgSpeed: 44.2,        // km/h
  kmToGo: 36,
  inspectionsClear: true,
};

// --- Now-playing playlist (rotates every ~30s) ---
const PLAYLIST = [
  { title: 'Peloton Pulse', artist: 'stitchX Live', live: true },
  { title: 'Breakaway Beat', artist: 'stitchX Live', live: true },
  { title: 'Mountain Momentum', artist: 'stitchX Sessions', live: false },
  { title: 'Sprint Finish', artist: 'stitchX Live', live: true },
  { title: 'Tempo Climb', artist: 'stitchX Sessions', live: false },
];
let nowPlayingIndex = 0;

// Tick the simulation every 3s
setInterval(() => {
  // Gap wanders between 0 and 180s
  raceState.gap = Math.max(0, raceState.gap + (Math.random() * 20 - 10));
  if (raceState.gap > 180) raceState.gap = 180;

  // Avg speed drifts between 38 and 50 km/h
  raceState.avgSpeed = Math.min(
    50,
    Math.max(38, raceState.avgSpeed + (Math.random() * 2 - 1))
  );

  // Distance ticks down (resets at the finish)
  raceState.kmToGo = raceState.kmToGo - 0.4;
  if (raceState.kmToGo <= 0) raceState.kmToGo = 180;

  // Inspection flag flips occasionally
  if (Math.random() < 0.03) {
    raceState.inspectionsClear = !raceState.inspectionsClear;
  }
}, 3000);

// Rotate now-playing every 30s
setInterval(() => {
  nowPlayingIndex = (nowPlayingIndex + 1) % PLAYLIST.length;
}, 30000);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'stitchX_Radio API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/inspections', (req, res) => {
  res.json([
    { id: 1, rider: 'Rider A', status: 'PASS' },
    { id: 2, rider: 'Rider B', status: 'FAIL' },
  ]);
});

app.get('/stream', (req, res) => {
  // Demo stream — in production, point this at the real Icecast/Shoutcast URL.
  res.redirect('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
});

app.get('/now-playing', (req, res) => {
  res.json(PLAYLIST[nowPlayingIndex]);
});

app.get('/insights', (req, res) => {
  const { gap, avgSpeed, kmToGo, inspectionsClear } = raceState;
  const gapInt = Math.floor(gap);

  const raceLine1 =
    gapInt > 60
      ? `Breakaway gap stable at ${Math.floor(gapInt / 60)}:${(gapInt % 60)
          .toString()
          .padStart(2, '0')}`
      : 'Peloton closing in on breakaway';

  const raceLine2 =
    avgSpeed > 45 ? 'High pace detected across peloton' : 'Controlled pace before key climb';

  const riderLine1 =
    kmToGo < 20 ? 'GC riders preparing for final attacks' : 'GC leader holding position in peloton';
  const riderLine2 = 'No mechanical or inspection flags detected';

  const equipmentLine1 = inspectionsClear ? 'All scanned bikes compliant' : 'Inspection alerts detected';
  const equipmentLine2 = inspectionsClear ? 'No UCI inspection alerts' : 'Review required for flagged bikes';

  const alertLine1 = gapInt < 60 ? 'Breakaway under pressure' : 'Stable race conditions';
  const alertLine2 = kmToGo < 15 ? 'Final race phase approaching' : 'Monitoring race dynamics';

  res.json({
    raceDynamics: { label: 'RACE DYNAMICS', accent: 'yellow', line1: raceLine1, line2: raceLine2 },
    riderFocus:   { label: 'RIDER FOCUS',   accent: 'blue',   line1: riderLine1, line2: riderLine2 },
    equipmentStatus: { label: 'EQUIPMENT STATUS', accent: 'green', line1: equipmentLine1, line2: equipmentLine2 },
    liveAlert:   { label: 'LIVE ALERT',     accent: 'red',    line1: alertLine1, line2: alertLine2 },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
