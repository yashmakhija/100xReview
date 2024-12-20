const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");

// Configuration
const API_BASE_URL = "http://localhost:3050"; // Base URL of your API
const ENDPOINTS = [
  "/endpoint1",
  "/endpoint2",
  "/endpoint3",
  "/endpoint4",
  "/endpoint5",
];
const CHECK_INTERVAL = "*/30 * * * * *"; // Every 30 seconds
const LOG_FILE = "api_uptime_log.json"; // File to store uptime logs

// State to track API statuses and downtimes
let apiStatus = ENDPOINTS.reduce((acc, endpoint) => {
  acc[endpoint] = {
    isDown: false,
    downtimeStart: null,
    totalDowntime: 0, // In seconds
    totalChecks: 0,
    successfulChecks: 0,
  };
  return acc;
}, {});

// Function to log messages
function logMessage(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Function to write logs to a file
function writeLogsToFile() {
  fs.writeFileSync(LOG_FILE, JSON.stringify(apiStatus, null, 2));
}

// Function to calculate uptime percentage
function calculateUptime(endpoint) {
  const status = apiStatus[endpoint];
  const uptime = ((status.successfulChecks / status.totalChecks) * 100).toFixed(
    2
  );
  return isNaN(uptime) ? 0 : uptime;
}

// Function to check a single API
async function checkApi(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await axios.get(url);
    const currentStatus = response.status;

    // Update state for successful response
    apiStatus[endpoint].totalChecks++;
    if (currentStatus === 200) {
      apiStatus[endpoint].successfulChecks++;
      if (apiStatus[endpoint].isDown) {
        // If it was previously down, log downtime end
        const downtimeEnd = new Date();
        const downtimeDuration =
          (downtimeEnd - apiStatus[endpoint].downtimeStart) / 1000; // In seconds
        apiStatus[endpoint].totalDowntime += downtimeDuration;
        logMessage(
          `${endpoint} is back up. Downtime lasted ${downtimeDuration}s.`
        );
        apiStatus[endpoint].isDown = false;
        apiStatus[endpoint].downtimeStart = null;
      } else {
        logMessage(`${endpoint} is up and running.`);
      }
    }
  } catch (error) {
    // Update state for failure
    apiStatus[endpoint].totalChecks++;
    if (!apiStatus[endpoint].isDown) {
      // Log downtime start if not already down
      apiStatus[endpoint].isDown = true;
      apiStatus[endpoint].downtimeStart = new Date();
      logMessage(`${endpoint} is down. Downtime started.`);
    } else {
      // Update total downtime for ongoing downtime
      const now = new Date();
      const ongoingDowntime = (now - apiStatus[endpoint].downtimeStart) / 1000; // In seconds
      logMessage(
        `${endpoint} is still down. Total downtime so far: ${(
          apiStatus[endpoint].totalDowntime + ongoingDowntime
        ).toFixed(3)}s.`
      );
    }
  }
}

// Function to monitor all APIs
async function monitorApis() {
  const promises = ENDPOINTS.map((endpoint) => checkApi(endpoint));
  await Promise.all(promises);
  writeLogsToFile();
}

// Schedule API monitoring
cron.schedule(CHECK_INTERVAL, () => {
  logMessage("Starting API checks...");
  monitorApis();
});

// Endpoint for showing uptime report (Optional for viewing logs)
const express = require("express");
const app = express();
const port = 4000;

app.get("/api-report", (req, res) => {
  const report = ENDPOINTS.map((endpoint) => ({
    endpoint,
    uptime: `${calculateUptime(endpoint)}%`,
    totalDowntime: `${apiStatus[endpoint].totalDowntime.toFixed(3)}s`,
  }));
  res.json(report);
});

app.listen(port, () => {
  logMessage(`Uptime report server running at http://localhost:${port}`);
});
