const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let raceState = {
  gap: 90,
  avgSpeed: 44.2,
  kmToGo: 36,
  inspectionsClear: true,
};

const PLAYLIST = [
  { title: "Peloton Pulse", artist: "stitchX Live", live: true },
  { title: "Breakaway Beat", artist: "stitchX Live", live: true },
  { title: "Mountain Momentum", artist: "stitchX Sessions", live: false },
  { title: "Sprint Finish", artist: "stitchX Live", live: true },
  { title: "Tempo Climb", artist: "stitchX Sessions", live: false },
];

let nowPlayingIndex = 0;

setInterval(() => {
  raceState.gap = Math.max(0, raceState.gap + (Math.random() * 20 - 10));
  if (raceState.gap > 180) raceState.gap = 180;

  raceState.avgSpeed = Math.min(
    50,
    Math.max(38, raceState.avgSpeed + (Math.random() * 2 - 1))
  );

  raceState.kmToGo = raceState.kmToGo - 0.4;
  if (raceState.kmToGo <= 0) raceState.kmToGo = 180;

  if (Math.random() < 0.03) {
    raceState.inspectionsClear = !raceState.inspectionsClear;
  }
}, 3000);

setInterval(() => {
  nowPlayingIndex = (nowPlayingIndex + 1) % PLAYLIST.length;
}, 30000);

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "stitchX Intelligence API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/version-check", (req, res) => {
  res.json({ version: "BACKEND_OK_001" });
});

app.get("/now-playing", (req, res) => {
  res.json(PLAYLIST[nowPlayingIndex]);
});

app.get("/stream", (req, res) => {
  res.redirect("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
});

app.get("/insights", (req, res) => {
  const mode = req.query.mode || "live";
  const { gap, avgSpeed, kmToGo, inspectionsClear } = raceState;
  const gapInt = Math.floor(gap);

  if (mode === "fan") {
    return res.json({
      raceDynamics: {
        label: "RACE STORY",
        accent: "yellow",
        line1: "Breakaway still holding strong",
        line2: "Fans watching the chase build",
      },
      riderFocus: {
        label: "RIDER SPOTLIGHT",
        accent: "blue",
        line1: "GC leader calm in peloton",
        line2: "Saving energy for the climb",
      },
      equipmentStatus: {
        label: "HYPE ALERT",
        accent: "red",
        line1: "Attack window approaching",
        line2: "Fireworks expected soon",
      },
      liveAlert: {
        label: "CROWD ENERGY",
        accent: "green",
        line1: "Crowd intensity rising",
        line2: "Final km tension building",
      },
    });
  }

  if (mode === "officials") {
    return res.json({
      raceDynamics: {
        label: "INSPECTION STATUS",
        accent: "green",
        line1: "All bikes compliant",
        line2: "No inspection alerts",
      },
      riderFocus: {
        label: "RIDER CHECK",
        accent: "blue",
        line1: "Riders cleared for stage",
        line2: "No safety holds",
      },
      equipmentStatus: {
        label: "OFFICIAL ALERTS",
        accent: "red",
        line1: "No violations detected",
        line2: "Monitoring continues",
      },
      liveAlert: {
        label: "RACE CONTROL",
        accent: "yellow",
        line1: "Race operations stable",
        line2: "Communications active",
      },
    });
  }

  const raceLine1 =
    gapInt > 60
      ? `Breakaway gap stable at ${Math.floor(gapInt / 60)}:${(gapInt % 60)
          .toString()
          .padStart(2, "0")}`
      : "Peloton closing in on breakaway";

  const raceLine2 =
    avgSpeed > 45
      ? "High pace detected across peloton"
      : "Controlled pace before key climb";

  const riderLine1 =
    kmToGo < 20
      ? "GC riders preparing for final attacks"
      : "GC leader holding position in peloton";

  const riderLine2 = "No mechanical or inspection flags detected";

  const equipmentLine1 = inspectionsClear
    ? "All scanned bikes compliant"
    : "Inspection alerts detected";

  const equipmentLine2 = inspectionsClear
    ? "No UCI inspection alerts"
    : "Review required for flagged bikes";

  const alertLine1 =
    gapInt < 60 ? "Breakaway under pressure" : "Stable race conditions";

  const alertLine2 =
    kmToGo < 15 ? "Final race phase approaching" : "Monitoring race dynamics";

  res.json({
    raceDynamics: {
      label: "RACE DYNAMICS",
      accent: "yellow",
      line1: raceLine1,
      line2: raceLine2,
    },
    riderFocus: {
      label: "RIDER FOCUS",
      accent: "blue",
      line1: riderLine1,
      line2: riderLine2,
    },
    equipmentStatus: {
      label: "EQUIPMENT STATUS",
      accent: "green",
      line1: equipmentLine1,
      line2: equipmentLine2,
    },
    liveAlert: {
      label: "LIVE ALERT",
      accent: "red",
      line1: alertLine1,
      line2: alertLine2,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
