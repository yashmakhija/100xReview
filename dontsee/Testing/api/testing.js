const axios = require("axios");
const cron = require("node-cron");

// Configuration
const APIs = [
  { name: "API 1", url: "https://api.example1.com" },
  { name: "API 2", url: "https://api.example2.com" },
  // Add more APIs here
];
const CHECK_INTERVAL = "*/10 * * * * *"; // Every 10 seconds

// State to track downtime
let apiStates = {};

// Initialize states for each API
APIs.forEach((api) => {
  apiStates[api.url] = {
    isDown: false,
    downtimeStart: null,
  };
});

// Function to log messages
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Function to monitor a single API
async function checkApi(api) {
  try {
    const response = await axios.get(api.url, { timeout: 5000 });
    if (response.status === 200) {
      // API is up
      const state = apiStates[api.url];
      if (state.isDown) {
        // Downtime ended
        const downtimeEnd = new Date();
        const downtimeDuration = (downtimeEnd - state.downtimeStart) / 1000; // In seconds
        log(`${api.name} is back up. Downtime lasted ${downtimeDuration}s.`);
        state.isDown = false;
        state.downtimeStart = null;
      } else {
        log(`${api.name} is up and running.`);
      }
    }
  } catch (error) {
    // API is down
    const state = apiStates[api.url];
    if (!state.isDown) {
      state.isDown = true;
      state.downtimeStart = new Date();
      log(`${api.name} is down. Downtime started.`);
    } else {
      log(`${api.name} is still down.`);
    }
  }
}

// Function to monitor all APIs concurrently
async function checkAllApis() {
  const promises = APIs.map((api) => checkApi(api));
  await Promise.all(promises);
}

// Schedule API checks
cron.schedule(CHECK_INTERVAL, () => {
  log("Starting API checks...");
  checkAllApis();
});
