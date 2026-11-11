import dotenv from "dotenv";

dotenv.config();

const requiredVariables = [
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "COOKIE_SECRET",
  "MAIL_HOST",
  "MAIL_USER",
  "MAIL_PASSWORD",
  "MAIL_FROM",
  "PASSWORD_RESET_URL",
  "EMAIL_VERIFY_URL",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
}

if (
  process.env.JWT_ACCESS_SECRET.length < 32 ||
  process.env.JWT_REFRESH_SECRET.length < 32 ||
  process.env.COOKIE_SECRET.length < 32
) {
  throw new Error("JWT and cookie secrets must be at least 32 characters.");
}

export const env = Object.freeze({
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",

  COOKIE_SECRET: process.env.COOKIE_SECRET,

  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: Number(process.env.MAIL_PORT) || 465,
  MAIL_SECURE: process.env.MAIL_SECURE !== "false",
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_FROM: process.env.MAIL_FROM,

  PASSWORD_RESET_URL: process.env.PASSWORD_RESET_URL,
  EMAIL_VERIFY_URL: process.env.EMAIL_VERIFY_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
AI_MAX_CODE_LENGTH: Number(process.env.AI_MAX_CODE_LENGTH || 30000),
AI_RATE_LIMIT: Number(process.env.AI_RATE_LIMIT || 10),
});