const express = require("express");
const cors = require("cors");
const { getRaceData } = require("./data/liveData");

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

app.get("/insights", async (req, res) => {
  const data = await getRaceData();
  const mode = req.query.mode || "live";

  if (mode === "fan") {
    return res.json({
      story: {
        label: "FAN STORY",
        accent: "yellow",
        line1: `${data.leader} is driving the race narrative`,
        line2: `Peloton moving at ${data.pelotonSpeedKph} km/h`,
      },
    });
  }

  if (mode === "officials") {
    return res.json({
      inspection: {
        label: "INSPECTION STATUS",
        accent: data.inspectionAlerts > 0 ? "red" : "green",
        line1:
          data.inspectionAlerts > 0
            ? "Inspection alerts detected"
            : "All bikes compliant",
        line2: "Live compliance feed active",
      },
    });
  }

  return res.json({
    race: {
      label: "RACE DYNAMICS",
      accent: "yellow",
      line1: `Breakaway gap ${data.gapSeconds}s`,
      line2: "Live race intelligence feed active",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
