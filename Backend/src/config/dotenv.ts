import { config } from "dotenv";

config(); // Load environment variables from .env file

// Ensure required environment variables are defined
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the .env file.");
}

console.log("Environment variables loaded successfully.");
