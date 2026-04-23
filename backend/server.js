const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT || 8080;

// --- Race state (mutated by the simulation loop below) ---
let raceState = {
  gap: 90,
  avgSpeed: 44.2,
  kmToGo: 36,
  inspectionsClear: true,
};

// --- Now-playing playlist (rotates every ~30s) ---
const PLAYLIST = [
  { title: "Peloton Pulse", artist: "stitchX Live", live: true },
  { title: "Breakaway Beat", artist: "stitchX Live", live: true },
  { title: "Mountain Momentum", artist: "stitchX Sessions", live: false },
  { title: "Sprint Finish", artist: "stitchX Live", live: true },
  { title: "Tempo Climb", artist: "stitchX Sessions", live: false },
];
let nowPlayingIndex = 0;

// Tick the simulation every 3s
setInterval(() => {
  raceState.gap = Math.max(0, raceState.gap + (Math.random() * 20 - 10));
  if (raceState.gap > 180) raceState.gap = 180;

  raceState.avgSpeed = Math.min(
    50,
    Math.max(38, raceState.avgSpeed + (Math.random() * 2 - 1))
  );

  raceState.kmToGo -= 0.4;
  if (raceState.kmToGo <= 0) raceState.kmToGo = 180;

  if (Math.random() < 0.03) {
    raceState.inspectionsClear = !raceState.inspectionsClear;
  }
}, 3000);

// Rotate now-playing every 30s
setInterval(() => {
  nowPlayingIndex = (nowPlayingIndex + 1) % PLAYLIST.length;
}, 30000);

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Parse URL so we can read pathname and query params cleanly
  const base = `http://localhost:${PORT}`;
  const { pathname, searchParams } = new URL(req.url, base);

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: "Method not allowed" }));
    return;
  }

  // GET /
  if (pathname === "/") {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: "ok",
        service: "stitchX_intelligence API",
        version: "1.0.0",
        endpoints: ["/health", "/version-check", "/now-playing", "/insights"],
      })
    );
    return;
  }

  // GET /health
  if (pathname === "/health") {
    res.statusCode = 200;
    res.end(JSON.stringify({ message: "Backend is running" }));
    return;
  }

  // GET /version-check
  if (pathname === "/version-check") {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        version: "NEW_BACKEND_001",
        nowPlayingExists: true,
        modeSupport: true,
      })
    );
    return;
  }

  // GET /now-playing
  if (pathname === "/now-playing") {
    res.statusCode = 200;
    res.end(JSON.stringify(PLAYLIST[nowPlayingIndex]));
    return;
  }

  // GET /insights?mode=live|fan|officials
  if (pathname === "/insights") {
    const mode = searchParams.get("mode") || "live";
    const { gap, avgSpeed, kmToGo, inspectionsClear } = raceState;
    const gapInt = Math.floor(gap);

    if (mode === "fan") {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
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
        })
      );
      return;
    }

    if (mode === "officials") {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
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
        })
      );
      return;
    }

    // Default: live mode — driven by live raceState
    const raceLine1 =
      gapInt > 60
        ? `Breakaway gap stable at ${Math.floor(gapInt / 60)}:${String(
            gapInt % 60
          ).padStart(2, "0")}`
        : "Peloton closing in on breakaway";
    const raceLine2 =
      avgSpeed > 45
        ? "High pace detected across peloton"
        : "Controlled pace before key climb";
    const riderLine1 =
      kmToGo < 20
        ? "GC riders preparing for final attacks"
        : "GC leader holding position in peloton";
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

    res.statusCode = 200;
    res.end(
      JSON.stringify({
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
          line2: "No mechanical or inspection flags detected",
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
      })
    );
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Not found" }));
});

server.on("error", (error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
