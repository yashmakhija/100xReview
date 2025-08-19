import app from "./app";
import { connectDatabase } from "./config/prisma";
import { logInfo, logError } from "./services/LoggerService";

const PORT = process.env.PORT || 3901;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      logInfo(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || "development",
        port: PORT,
      });
    });
  } catch (error) {
    logError("Failed to start server", error as Error);
    process.exit(1);
  }
}

startServer();
