import axios from "axios";
import { Readable } from "stream";

const BUNNY_CDN_API_KEY = process.env.BUNNY_CDN_API_KEY;
const BUNNY_CDN_STORAGE_ZONE = process.env.BUNNY_CDN_STORAGE_ZONE;

export async function uploadToBunnyCDN(
  videoBuffer: Buffer,
  fileName: string
): Promise<string> {
  if (!BUNNY_CDN_API_KEY || !BUNNY_CDN_STORAGE_ZONE) {
    throw new Error("Bunny CDN API key or storage zone is not set");
  }

  try {
    const stream = Readable.from(videoBuffer);

    const response = await axios.put(
      `https://storage.bunnycdn.com/${BUNNY_CDN_STORAGE_ZONE}/${fileName}`,
      stream,
      {
        headers: {
          AccessKey: BUNNY_CDN_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (response.status === 201) {
      console.log("Video uploaded successfully to Bunny CDN");
      return `https://${BUNNY_CDN_STORAGE_ZONE}.b-cdn.net/${fileName}`;
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
