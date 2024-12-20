const express = require("express");
const app = express();
const port = 3050;

// Define the status codes for the endpoints
let endpointStatuses = {
  "/endpoint1": 200,
  "/endpoint2": 200,
  "/endpoint3": 200,
  "/endpoint4": 200,
  "/endpoint5": 200,
};

// Function to randomly update the status code
function updateStatusCodes() {
  Object.keys(endpointStatuses).forEach((endpoint) => {
    // Randomly assign 200 or 400
    endpointStatuses[endpoint] = Math.random() > 0.5 ? 200 : 400;
  });
  console.log("Updated statuses:", endpointStatuses);
}

// Initialize status updates every 30 seconds
setInterval(updateStatusCodes, 30000);

// Define endpoints
Object.keys(endpointStatuses).forEach((endpoint) => {
  app.get(endpoint, (req, res) => {
    const currentStatus = endpointStatuses[endpoint];
    res
      .status(currentStatus)
      .json({ status: currentStatus, message: "Random status" });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`EME backend API is running at http://localhost:${port}`);
  console.log("Endpoints:");
  Object.keys(endpointStatuses).forEach((endpoint) => {
    console.log(`- http://localhost:${port}${endpoint}`);
  });
});
