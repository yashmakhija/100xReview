import axios from "axios";
import { Readable } from "stream";

const CDN_BASE_UPLOAD_URL = process.env.CDN_BASE_UPLOAD_URL;
const CDN_BASE_ACCESS_URL = process.env.CDN_BASE_ACCESS_URL;
const CDN_API_KEY = process.env.CDN_API_KEY;

export async function uploadToBunnyCDN(
  videoBuffer: Buffer,
  fileName: string
): Promise<string> {
  if (!CDN_BASE_UPLOAD_URL || !CDN_BASE_ACCESS_URL) {
    throw new Error("Bunny CDN API key or storage zone is not set");
  }

  try {
    const stream = Readable.from(videoBuffer);

    const response = await axios.put(
      `${CDN_BASE_UPLOAD_URL}/${fileName}`,
      stream,
      {
        headers: {
          AccessKey: CDN_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (response.status === 201) {
      console.log("Video uploaded successfully to Bunny CDN");
      return `${CDN_BASE_ACCESS_URL}/${fileName}`;
    } else {
      throw new Error(
        `Failed to upload video to Bunny CDN. Status: ${response.status}`
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error uploading to Bunny CDN:",
        error.response?.data || error.message
      );
    } else {
      console.error("Error uploading to Bunny CDN:", error);
    }
    throw error;
  }
}

export async function previewBunnyCDNFile(
  fileName: string
): Promise<string | null> {
  if (!CDN_API_KEY || !CDN_BASE_ACCESS_URL) {
    throw new Error("Bunny CDN API key or storage zone is not set");
  }

  try {
    const fileUrl = `${CDN_BASE_ACCESS_URL}/${fileName}`;
    const response = await axios.head(fileUrl, {
      headers: {
        AccessKey: CDN_API_KEY,
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

// Example usage
export const testUpload = async () => {
  try {
    const testBuffer = Buffer.from("This is a test file content");
    const testFileName = "test_file.txt";
    const url = await uploadToBunnyCDN(testBuffer, testFileName);
    console.log("Uploaded file URL:", url);
  } catch (error) {
    console.error("Test upload failed:", error);
  }
};
