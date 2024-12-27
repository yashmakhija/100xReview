const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_BASE_URL = "https://video.bunnycdn.com/library";

/**
 * Creates a video object in the Bunny Stream library
 * @param {string} title - The title of the video
 * @returns {Promise<Object>} - Returns the created video object
 */
async function createVideo(title) {
  try {
    const response = await axios.post(
      `${BUNNY_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
      { title },
      {
        headers: {
          AccessKey: BUNNY_STREAM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Video object created:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating video:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Uploads a video to Bunny Stream
 * @param {Buffer|fs.ReadStream} videoData - The video data to upload
 * @param {string} videoId - The ID of the video to upload to
 * @returns {Promise<Object>} - Returns the upload response
 */
async function uploadVideo(videoData, videoId) {
  try {
    const response = await axios.put(
      `${BUNNY_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      videoData,
      {
        headers: {
          AccessKey: BUNNY_STREAM_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    console.log("Video uploaded successfully");
    return response.data;
  } catch (error) {
    console.error(
      "Error uploading video:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Gets the status of a video
 * @param {string} videoId - The ID of the video to check
 * @returns {Promise<Object>} - Returns the video status
 */
async function getVideoStatus(videoId) {
  try {
    const response = await axios.get(
      `${BUNNY_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          AccessKey: BUNNY_STREAM_API_KEY,
        },
      }
    );
    console.log("Video status:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting video status:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Gets the HTML embed code for a video
 * @param {string} videoId - The ID of the video
 * @returns {string} - Returns the HTML embed code
 */
function getVideoEmbedCode(videoId) {
  return `<iframe src="https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}" loading="lazy" style="border: none; position: absolute; top: 0; height: 100%; width: 100%;" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowfullscreen="true"></iframe>`;
}

/**
 * Gets the direct video URL
 * @param {string} videoId - The ID of the video
 * @returns {string} - Returns the direct video URL
 */
function getVideoUrl(videoId) {
  return `https://iframe.mediadelivery.net/play/${BUNNY_LIBRARY_ID}/${videoId}`;
}

/**
 * Run diagnostics and test video upload
 */
async function runDiagnostics() {
  console.log("Running Bunny Stream API Diagnostics");
  console.log(
    "API Key (first 4 characters):",
    BUNNY_STREAM_API_KEY
      ? BUNNY_STREAM_API_KEY.substring(0, 4) + "..."
      : "Not set"
  );
  console.log("Library ID:", BUNNY_LIBRARY_ID || "Not set");

  if (!BUNNY_STREAM_API_KEY || !BUNNY_LIBRARY_ID) {
    console.error("Error: Bunny Stream API key or Library ID is not set");
    return;
  }

  try {
    // Test with the provided testing1.mp4 file
    const testFilePath = path.join(__dirname, "testing1.mp4");

    if (!fs.existsSync(testFilePath)) {
      console.error("testing1.mp4 file not found in the current directory");
      return;
    }

    // Create video object
    console.log("\nStep 1: Creating video object...");
    const video = await createVideo("Test Video " + Date.now());
    const videoId = video.guid;
    console.log("Video ID:", videoId);

    // Upload video
    console.log("\nStep 2: Uploading video...");
    const videoStream = fs.createReadStream(testFilePath);
    await uploadVideo(videoStream, videoId);

    // Check status
    console.log("\nStep 3: Checking video status...");
    let status;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
      status = await getVideoStatus(videoId);
      console.log("Current status:", status.status);
      attempts++;
    } while (status.status !== "encoded" && attempts < maxAttempts);

    // Get URLs
    console.log("\nVideo URLs:");
    console.log("Embed Code:", getVideoEmbedCode(videoId));
    console.log("Direct URL:", getVideoUrl(videoId));
  } catch (error) {
    console.error("Diagnostics failed:", error);
  }
}

// Run the diagnostics
runDiagnostics();
