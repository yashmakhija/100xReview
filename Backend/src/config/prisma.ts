import { PrismaClient, Prisma } from "@prisma/client";
import { logError, logInfo } from "../services/LoggerService";

/**
 * Database connection configuration using singleton pattern
 * This ensures a single PrismaClient instance is reused across the application
 */

// Define allowed log levels
type LogLevel = "info" | "query" | "warn" | "error";

// Prisma client options
const prismaOptions: Prisma.PrismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? (["query", "info", "warn", "error"] as LogLevel[])
      : (["warn", "error"] as LogLevel[]),
};

// Global singleton instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create or reuse PrismaClient instance
export const prisma = globalForPrisma.prisma || new PrismaClient(prismaOptions);

// Create connection pool in non-production environments
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Connection management with health monitoring
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;

/**
 * Connect to database with retry logic
 */
export async function connectDatabase() {
  if (isConnected) {
    return;
  }

  try {
    connectionAttempts++;
    logInfo(
      `Attempting to connect to database (attempt ${connectionAttempts})...`
    );

    // Test connection by executing a simple query
    await prisma.$connect();
    await prisma.$executeRaw`SELECT 1`;

    isConnected = true;
    connectionAttempts = 0;
    logInfo("Database connection established successfully.");
  } catch (error) {
    logError("Failed to connect to database", error as Error, {
      attempt: connectionAttempts,
    });

    // Handle retry logic
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      const delay = Math.min(1000 * 2 ** connectionAttempts, 30000); // Exponential backoff
      logInfo(`Retrying database connection in ${delay}ms...`);
      setTimeout(connectDatabase, delay);
    } else {
      logError(
        `Failed to connect to database after ${MAX_CONNECTION_ATTEMPTS} attempts. Giving up.`
      );
      process.exit(1); // Exit the process on complete failure
    }
  }
}

/**
 * Gracefully disconnect from database
 */
export async function disconnectDatabase() {
  if (!isConnected) {
    return;
  }

  try {
    await prisma.$disconnect();
    isConnected = false;
    logInfo("Database connection closed successfully.");
  } catch (error) {
    logError("Error while disconnecting from database", error as Error);
  }
}

/**
 * Handle application shutdown
 */
process.on("SIGINT", async () => {
  logInfo("Received SIGINT signal. Closing database connection...");
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logInfo("Received SIGTERM signal. Closing database connection...");
  await disconnectDatabase();
  process.exit(0);
});

/**
 * Add a ping method to check database connectivity
 */
export const pingDatabase = async (): Promise<boolean> => {
  try {
    await prisma.$executeRaw`SELECT 1`;
    return true;
  } catch (error) {
    logError("Database ping failed", error as Error);
    return false;
  }
};

// Export default instance for backward compatibility
export default prisma;
