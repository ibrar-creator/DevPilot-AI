import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";

import {
  notFound,
  errorHandler,
} from "./middlewares/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({
  extended: true,
  limit: "10kb",
}));

app.use(cookieParser(env.COOKIE_SECRET));

app.use("/api/v1", apiRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;