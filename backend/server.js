const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Optionally: startRaceSimulator(io);
});
module.exports = { io };

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

// --- DEMO: AI Rider Analysis Endpoint (from demo-data) ---
app.get('/api/analyze-rider/:riderId', (req, res) => {
  const riderId = req.params.riderId;
  try {
    const riders = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/riders.json')));
    const results = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/historical_results.json')));
    const rider = riders.find(r => r.riderId === riderId);
    const result = results.find(r => r.riderId === riderId);
    if (!rider) return res.status(404).json({ error: 'Rider not found', analysis: 'No data available for this rider.' });
    let analysisText = `Our AI has analyzed ${rider.name} of ${rider.team}. As a known ${rider.specialty}, they are well-suited for varied terrain. `;
    if (result) {
      analysisText += `Furthermore, a recent strong performance in the Tour de France (finishing ${result.position}) indicates excellent current form.`;
    } else {
      analysisText += "However, recent top results are not prominent, which may be a factor in their performance.";
    }
    res.json({
      ...rider,
      analysis: analysisText
    });
  } catch (error) {
    res.status(500).json({ error: 'Demo data unavailable', analysis: 'Could not retrieve demo rider data.' });
  }
});

// --- DEMO: Predict Winner Endpoint (from demo-data) ---
app.get('/api/predict-winner/:raceId', (req, res) => {
  const raceId = req.params.raceId;
  try {
    const results = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/historical_results.json')));
    const riders = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/riders.json')));
    const raceResults = results.filter(r => r.raceId === raceId);
    if (!raceResults.length) return res.status(404).json({ error: 'No results found for this race.' });
    // Pick the winner
    const winnerResult = raceResults.find(r => r.position === 1);
    const winner = winnerResult ? riders.find(r => r.riderId === winnerResult.riderId) : null;
    if (winner) {
      res.json({
        rider: {
          name: winner.name,
          team: winner.team
        },
        prediction: winner.name,
        analysis: `${winner.name} is predicted as the winner based on demo historical data.`
      });
    } else {
      res.json({
        rider: null,
        prediction: 'Unknown',
        analysis: 'No winner data available.'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Demo data unavailable', analysis: 'Could not retrieve demo race data.' });
  }
});

// --- DEMO: Race Context Endpoint (from demo-data) ---
app.get('/api/race-context/:raceId', (req, res) => {
  const raceId = req.params.raceId;
  try {
    const races = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/races.json')));
    const stages = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data/stages.json')));
    const race = races.find(r => r.raceId === raceId);
    const raceStages = stages.filter(s => s.raceId === raceId);
    if (!race) return res.status(404).json({ error: 'Race not found' });
    res.json({
      ...race,
      stages: raceStages
    });
  } catch (error) {
    res.status(500).json({ error: 'Demo data unavailable' });
  }
});

// --- DEMO: Fan Zone Endpoint (from demo-data) ---
app.get('/api/fan-zone/:raceId', (req, res) => {
  // For demo, just return a static message or empty array
  res.json({
    posts: [
      {
        id: 'demo-post-1',
        title: 'Who will win the next mountain stage?',
        body: 'Let us know your predictions for Stage 12!',
        author: 'DemoFan',
        raceId: req.params.raceId,
        created_at: new Date().toISOString()
      }
    ]
  });
});

// --- NEW AI PREDICTOR ENDPOINT (calls Python microservice) ---
app.get('/api/predict-winner/:riderName', async (req, res) => {
  const riderName = req.params.riderName; // e.g., "tadej-pogacar"
  try {
    const response = await fetch(`http://127.0.0.1:5001/rider/${riderName}`);
    if (!response.ok) {
      throw new Error(`Python service error: ${response.status}`);
    }
    const data = await response.json();
    res.json({
      prediction: data.name || riderName,
      analysis: `Based on PCS data, ${data.name || riderName} is a top favorite.`,
      pcs_data: data
    });
  } catch (error) {
    console.error("Failed to fetch prediction data from Python pcs-api service:", error);
    res.status(500).json({ 
      prediction: "Unavailable", 
      analysis: "Could not retrieve PCS data at this time." 
    });
  }
});

// --- Existing API Endpoints ---
app.get('/api/race-updates', (req, res) => {
  const { race_id } = req.query;
  let sql = `SELECT * FROM race_updates WHERE is_published = 1`;
  const params = [];
  if (race_id) {
    sql += ` AND race_id = ?`;
    params.push(race_id);
  }
  sql += ` ORDER BY datetime(timestamp) DESC, created_at DESC`;
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch race updates' });
    }
    res.json({ success: true, updates: rows });
  });
});

app.post('/api/race-updates', (req, res) => {
    const { race_id, type, title, message, rider_name, team, km_to_go, timestamp, is_published } = req.body;
    const update = {
        id: generateId('ru'), race_id, type: type || 'general', title, message,
        rider_name: rider_name || '', team: team || '', km_to_go: km_to_go ?? null,
        timestamp: timestamp || new Date().toISOString(), is_published: is_published !== false ? 1 : 0
    };
    db.run(`INSERT INTO race_updates VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [update.id, update.race_id, update.type, update.title, update.message, update.rider_name, update.team, update.km_to_go, update.timestamp, update.is_published],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: 'Failed to create race update' });
            io.emit('liverace:update', update);
            res.json({ success: true, update });
        }
    );
});

app.get('/api/fan-zone', (req, res) => {
  db.all(`SELECT * FROM fan_zone_posts WHERE is_published = 1 ORDER BY is_featured DESC, datetime(created_at) DESC`,
    [], (err, rows) => {
      if (err) return res.status(500).json({ success: false, error: 'Failed to fetch fan zone posts' });
      res.json({ success: true, posts: rows });
    }
  );
});

app.post('/api/fan-zone', (req, res) => {
    const { title, body, category, media_url, author_name, race_id, is_featured, is_published } = req.body;
    const now = new Date().toISOString();
    const post = {
        id: generateId('fz'), title, body, category: category || 'general', media_url: media_url || '',
        author_name: author_name || '', race_id: race_id || '', is_featured: is_featured ? 1 : 0,
        is_published: is_published !== false ? 1 : 0, created_at: now, updated_at: now
    };
    db.run(`INSERT INTO fan_zone_posts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [post.id, post.title, post.body, post.category, post.media_url, post.author_name, post.race_id, post.is_featured, post.is_published, post.created_at, post.updated_at],
        function(err) {
            if (err) return res.status(500).json({ success: false, error: 'Failed to create fan zone post' });
            io.emit('fanzone:update', post);
            res.json({ success: true, post });
        }
    );
});

// --- 🧠 RIDER SCORING LOGIC (The Secret Sauce) ---

// 1. Mock Data (Replace with DB or ProCyclingStats later)
const riderDatabase = {
  'pogacar-tadej': {
    name: 'Tadej Pogačar',
    team: 'UAE Team Emirates',
    specialty: 'climber',
    weight: '66kg',
    formIndex: 92,
    strengths: ['climbing', 'punchy finishes']
  },
  'vingegaard-jonas': {
    name: 'Jonas Vingegaard',
    team: 'Jumbo-Visma',
    specialty: 'climber',
    weight: '60kg',
    formIndex: 90,
    strengths: ['climbing', 'high-altitude']
  },
  'mas-enric': {
    name: 'Enric Mas',
    team: 'Movistar',
    specialty: 'climber',
    weight: '61kg',
    formIndex: 78,
    strengths: ['climbing']
  },
  'philipsen-jasper': {
    name: 'Jasper Philipsen',
    team: 'Alpecin-Deceuninck',
    specialty: 'sprinter',
    weight: '75kg',
    formIndex: 88,
    strengths: ['sprinting']
  },
  'alaphilippe-julian': {
    name: 'Julian Alaphilippe',
    team: 'Soudal-QuickStep',
    specialty: 'puncheur',
    weight: '62kg',
    formIndex: 85,
    strengths: ['punchy finishes', 'descents']
  },
  'pidcock-tom': {
    name: 'Tom Pidcock',
    team: 'INEOS Grenadiers',
    specialty: 'puncheur',
    weight: '58kg',
    formIndex: 83,
    strengths: ['descents', 'technical riding']
  },
  'van-aert-wout': {
    name: 'Wout van Aert',
    team: 'Jumbo-Visma',
    specialty: 'all-rounder',
    weight: '78kg',
    formIndex: 80,
    strengths: ['sprinting', 'breakaways', 'TT']
  },
  'ganna-filippo': {
    name: 'Filippo Ganna',
    team: 'INEOS Grenadiers',
    specialty: 'time trialist',
    weight: '83kg',
    formIndex: 89,
    strengths: ['time trial', 'flat power']
  }
};

function generateIntelligence(stageType) {
    const safeStageType = stageDatabase[stageType] ? stageType : 'mountain';
    const stage = stageDatabase[safeStageType];
    let insights = { favorites: [], surprises: [], risks: [], narrative: "" };
    const createPrediction = (riderId, reasonText) => {
        const profile = riderDatabase[riderId];
        if (!profile) return null;
        return {
            name: profile.name,
            reason: reasonText,
            profile: {
                team: profile.team,
                specialty: profile.specialty,
                weight: profile.weight,
                formIndex: profile.formIndex,
                strengths: profile.strengths
            }
        };
    };
    if (safeStageType === 'mountain') {
        const fav = createPrediction('vingegaard-jonas', "The sustained gradients of the HC climbs perfectly match his high W/kg threshold.");
        if (fav) insights.favorites.push(fav);
        const sur = createPrediction('pidcock-tom', "⚡ WEATHER ALERT: With thunderstorms predicted on the descent, his legendary bike handling makes him a massive threat.");
        if (sur) insights.surprises.push(sur);
        const risk = createPrediction('van-aert-wout', "⚠️ RISK: Long HC climbs and altitude are not ideal for a heavier powerhouse rider, especially if the pace is brutal early.");
        if (risk) insights.risks.push(risk);
        insights.narrative = "The GC battle will explode here. Watch the climbers, but the weather and descent could create a surprise.";
    } else if (safeStageType === 'hilly') {
        const fav = createPrediction('pogacar-tadej', "His explosive anaerobic power is unmatched on these short, steep kickers.");
        if (fav) insights.favorites.push(fav);
        const sur = createPrediction('van-aert-wout', "🔄 REDEMPTION WATCH: He had a quiet day yesterday, likely saving his legs specifically for today's explosive finale.");
        if (sur) insights.surprises.push(sur);
        const risk = createPrediction('vingegaard-jonas', "⚠️ RISK: Short punchy climbs may not favor his long sustained-climb style as much as a true mountain stage.");
        if (risk) insights.risks.push(risk);
        insights.narrative = "It's a day for the puncheurs. Heat and repeated accelerations could punish pure climbers.";
    } else if (safeStageType === 'time_trial') {
        const fav = createPrediction('ganna-filippo', "🌬️ WIND ADVANTAGE: At 83kg, his raw power and mass make him incredibly stable in today's severe crosswinds.");
        if (fav) insights.favorites.push(fav);
        const sur = createPrediction('van-aert-wout', "A technical powerhouse who can navigate the tricky corners better than pure TT specialists.");
        if (sur) insights.surprises.push(sur);
        const risk = createPrediction('pidcock-tom', "⚠️ RISK: His light build and punchy style are less suited to a windy flat time trial against pure specialists.");
        if (risk) insights.risks.push(risk);
        insights.narrative = "The race of truth. Wind and aerodynamics could expose lighter riders today.";
    }
    return { stageContext: stage, insights };
}

app.get('/stage-intelligence', (req, res) => {
    const requestedType = req.query.type || 'mountain';
    const { stageContext, insights } = generateIntelligence(requestedType);
    res.json({
        stage: { type: requestedType },
        stageContext,
        insights
    });
});

function generateRadioFromEvent(event, currentStageType = 'mountain') {
  const stage = stageDatabase[currentStageType] || {};
  if (event.event_type === 'attack') {
    return {
      headline: `${event.rider} launches an attack!`,
      explanation: `This is a decisive move. On a ${currentStageType} stage, timing matters as much as strength.`,
      nextWatch: `Watch how quickly the favorites respond. If the gap grows in the next few minutes, this could become dangerous.`
    };
  }
  if (event.event_type === 'gap') {
    return {
      headline: `The gap is changing fast.`,
      explanation: event.message || `This could shift the balance between the breakaway and the peloton.`,
      nextWatch: `If the gap keeps growing, teams may need to chase earlier than planned.`
    };
  }
  if (event.event_type === 'crash') {
    return {
      headline: `Crash reported in the race.`,
      explanation: `This could disrupt team strategy and force favorites to spend energy getting back into position.`,
      nextWatch: `Watch whether any key riders are delayed.`
    };
  }
  if (event.event_type === 'weather') {
    return {
      headline: `Weather is now a major factor.`,
      explanation: `${stage.weather || 'Weather change'}. This can change which riders are favored.`,
      nextWatch: `Watch technical riders and strong bike handlers.`
    };
  }
  return {
    headline: event.message || `Race update received.`,
    explanation: `This event may influence the rhythm of the race.`,
    nextWatch: `Watch how the peloton reacts.`
  };
}

app.post('/race-event', (req, res) => {
  const event = req.body;
  const radio = generateRadioFromEvent(event, event.stage_type || 'mountain');
  latestRaceState.last_event = event;
  latestRaceState.ai_radio = radio;
  res.json({
    ok: true,
    event,
    ai_radio: radio
  });
});

app.get("/version", (req, res) => {
  res.json({
    version: "stage-intelligence-v1",
    commit: "7c071ff"
  });
});

