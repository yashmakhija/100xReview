const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const BUNNY_CDN_API_KEY = process.env.BUNNY_CDN_API_KEY;
const BUNNY_CDN_STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE;

async function runDiagnostics() {
  console.log("Running BunnyCDN Detailed Diagnostics");
  console.log(
    "API Key (first 4 characters):",
    BUNNY_CDN_API_KEY ? BUNNY_CDN_API_KEY.substring(0, 4) + "..." : "Not set"
  );
  console.log(
    "API Key length:",
    BUNNY_CDN_API_KEY ? BUNNY_CDN_API_KEY.length : "N/A"
  );
  console.log("Storage Zone:", BUNNY_CDN_STORAGE_ZONE || "Not set");

  if (!BUNNY_CDN_API_KEY || !BUNNY_CDN_STORAGE_ZONE) {
    console.error("Error: BunnyCDN API key or storage zone is not set");
    return;
  }

  // Test 1: List files (GET request)
  await testRequest(
    "GET",
    `https://storage.bunnycdn.com/${BUNNY_CDN_STORAGE_ZONE}/`
  );

  // Test 2: Upload a small file (PUT request)
  const testContent = "This is a test file for BunnyCDN diagnostics.";
  const testFileName = `test_file_${Date.now()}.txt`;
  await testRequest(
    "PUT",
    `https://storage.bunnycdn.com/${BUNNY_CDN_STORAGE_ZONE}/${testFileName}`,
    testContent
  );

  // Test 3: Download the uploaded file (GET request)
  await testRequest(
    "GET",
    `https://storage.bunnycdn.com/${BUNNY_CDN_STORAGE_ZONE}/${testFileName}`
  );

  console.log(
    "\nDiagnostics complete. If all tests failed, please check your API key and storage zone settings."
  );
}

async function testRequest(method, url, data = null) {
  console.log(`\nTesting ${method} request to: ${url}`);
  try {
    const config = {
      method,
      url,
      headers: {
        AccessKey: BUNNY_CDN_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      data,
    };

    const response = await axios(config);
    console.log("Request successful!");
    console.log("Status:", response.status);
    console.log(
      "Response data:",
      typeof response.data === "string"
        ? response.data.substring(0, 100)
        : response.data
    );
  } catch (error) {
    console.error("Request failed:");
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Request config:", {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
    } else {
      console.error(error);
    }
  }
}

runDiagnostics();