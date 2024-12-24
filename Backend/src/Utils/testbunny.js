const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const BUNNY_CDN_API_KEY = process.env.BUNNY_CDN_API_KEY;
const BUNNY_CDN_STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE;

/**
 * Function to preview a BunnyCDN file.
 * @param {string} fileName - The name of the file to preview.
 * @returns {Promise<string | null>} - Returns the file URL if successful, otherwise null.
 */
async function previewBunnyCDNFile(fileName) {
  if (!BUNNY_CDN_API_KEY || !BUNNY_CDN_STORAGE_ZONE) {
    throw new Error("Bunny CDN API key or storage zone is not set");
  }

  try {
    const fileUrl = `https://${BUNNY_CDN_STORAGE_ZONE}.b-cdn.net/100xreviews/${fileName}`;
    const response = await axios.head(fileUrl, {
      headers: {
        AccessKey: BUNNY_CDN_API_KEY,
      },
    });

    if (response.status === 200) {
      console.log("Preview file is accessible on Bunny CDN");
      return fileUrl;
    } else {
      throw new Error(
        `Failed to access preview file on Bunny CDN. Status: ${response.status}`
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error previewing file on Bunny CDN:",
        error.response?.data || error.message
      );
    } else {
      console.error("Error previewing file on Bunny CDN:", error);
    }
    return null;
  }
}

/**
 * Function to get a BunnyCDN file.
 * @param {string} fileName - The name of the file to get.
 * @returns {Promise<Buffer | null>} - Returns the file content as a buffer if successful, otherwise null.
 */
async function getBunnyCDNFile(fileName) {
  if (!BUNNY_CDN_API_KEY || !BUNNY_CDN_STORAGE_ZONE) {
    throw new Error("Bunny CDN API key or storage zone is not set");
  }

  try {
    const fileUrl = `https://${BUNNY_CDN_STORAGE_ZONE}.b-cdn.net/100xreviews/${fileName}`;
    const response = await axios.get(fileUrl, {
      headers: {
        AccessKey: BUNNY_CDN_API_KEY,
      },
      responseType: "arraybuffer",
    });

    if (response.status === 200) {
      console.log("File retrieved successfully from Bunny CDN");
      return response.data;
    } else {
      throw new Error(
        `Failed to retrieve file from Bunny CDN. Status: ${response.status}`
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error retrieving file from Bunny CDN:",
        error.response?.data || error.message
      );
    } else {
      console.error("Error retrieving file from Bunny CDN:", error);
    }
    return null;
  }
}

/**
 * Create a folder in BunnyCDN if it doesn't exist
 * @param {string} folderPath - The folder path to create
 */
async function createFolderIfNotExists(folderPath) {
  try {
    console.log(`Checking/Creating folder: ${folderPath}`);
    const response = await axios.put(
      `https://storage.bunnycdn.com/${BUNNY_CDN_STORAGE_ZONE}/${folderPath}/`,
      null,
      {
        headers: {
          AccessKey: BUNNY_CDN_API_KEY,
        },
      }
    );
    console.log(`Folder ${folderPath} created or already exists`);
    return true;
  } catch (error) {
    console.error(`Error creating folder ${folderPath}:`, error.message);
    return false;
  }
}

/**
 * Run detailed diagnostics for BunnyCDN.
 */
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

  // First create the folder
  const folderCreated = await createFolderIfNotExists("100xreviews");
  if (!folderCreated) {
    console.error(
      "Failed to create/verify folder structure. Aborting upload test."
    );
    return;
  }

  const testFilePath = path.join(__dirname, "test_file.txt"); // Path to your test file

  console.log("testFilePath", testFilePath);
  if (!fs.existsSync(testFilePath)) {
    fs.writeFileSync(
      testFilePath,
      "This is a test file for BunnyCDN diagnostics."
    );
  }

  const testFileName = `new_fod${Date.now()}.txt`;
  console.log("Uploading test file:", testFileName);

  await testRequest(
    "PUT",
    `https://storage.bunnycdn.com/${BUNNY_CDN_STORAGE_ZONE}/100xreviews/${testFileName}`,
    fs.createReadStream(testFilePath)
  );

  console.log(
    "\nDiagnostics complete. If all tests failed, please check your API key and storage zone settings."
  );
}

/**
 * Test BunnyCDN requests.
 * @param {string} method - HTTP method to use.
 * @param {string} url - URL for the request.
 * @param {any} data - Request body data (optional).
 */
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

/**
 * Wrapper test function to execute specific tests.
 * @param {string} type - Type of test to run.
 * @param {string} [fileName] - Optional file name for preview tests.
 */
async function test(type, fileName) {
  switch (type) {
    case "diagnostics":
      await runDiagnostics();
      break;
    case "preview":
      if (!fileName) {
        console.error("File name is required for preview test.");
        return;
      }
      const previewResult = await previewBunnyCDNFile(fileName);
      console.log("Preview result:", previewResult);
      break;
    case "get":
      if (!fileName) {
        console.error("File name is required for get test.");
        return;
      }
      const fileContent = await getBunnyCDNFile(fileName);
      if (fileContent) {
        console.log(
          "File content retrieved:",
          fileContent.toString().substring(0, 100)
        );
      }
      break;
    default:
      console.error(
        "Unknown test type. Use 'diagnostics', 'preview', or 'get'."
      );
  }
}

// Example: Run the test function with "diagnostics", "preview", or "get"
test("diagnostics"); // Run diagnostics
test("preview", "example_file.txt"); // Preview a specific file
test("get", "example_file.txt"); // Get a specific file

/**
 * Note: Only users with the API key can access the BunnyCDN API. Ensure that the key is securely stored and not exposed to unauthorized users.
 */
