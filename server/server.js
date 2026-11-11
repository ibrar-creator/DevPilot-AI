import mongoose from "mongoose";

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";

let server;
let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      console.log("--------------------------------");
      console.log("DevPilot AI Backend Started");
      console.log(`Port: ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`URL: http://localhost:${env.PORT}`);
      console.log("--------------------------------");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  if (!server) {
    process.exit(0);
  }

  server.close(async () => {
    try {
      await mongoose.disconnect();

      console.log("Server and database disconnected.");

      process.exit(0);
    } catch (error) {
      console.error("Shutdown error:", error.message);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forced shutdown due to timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();