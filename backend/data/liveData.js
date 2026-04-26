/**
 * liveData.js
 *
 * Provides simulated race data via getRaceData().
 * This is the integration point where real race timing, GPS, and API data
 * will be swapped in later.
 */

async function getRaceData() {
  return {
    gapSeconds: 145,
    leader: "T. Pogačar",
    pelotonSpeedKph: 52,
    inspectionAlerts: 1,
  };
}

module.exports = { getRaceData };
