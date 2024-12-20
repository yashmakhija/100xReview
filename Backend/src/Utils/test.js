const axios = require("axios");
const { Readable } = require("stream");
const dotenv = require("dotenv");

dotenv.config();

console.log(
  "BUNNY_CDN_API_KEY:",
  process.env.BUNNY_CDN_API_KEY ? "Set" : "Not set"
);
console.log(
  "BUNNY_CDN_STORAGE_ZONE:",
  process.env.BUNNY_CDN_STORAGE_ZONE ? "Set" : "Not set"
);

if (process.env.BUNNY_CDN_API_KEY && process.env.BUNNY_CDN_STORAGE_ZONE) {
  console.log("Both environment variables are set correctly.");
  console.log(
    "API Key (first 4 characters):",
    process.env.BUNNY_CDN_API_KEY.substring(0, 4) + "..."
  );
  console.log("Storage Zone:", process.env.BUNNY_CDN_STORAGE_ZONE);
} else {
  console.log("Error: One or both environment variables are not set.");
  if (!process.env.BUNNY_CDN_API_KEY) {
    console.log("BUNNY_CDN_API_KEY is missing.");
  }
  if (!process.env.BUNNY_CDN_STORAGE_ZONE) {
    console.log("BUNNY_CDN_STORAGE_ZONE is missing.");
  }
}
