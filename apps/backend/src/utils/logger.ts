import { createLogger, format, transports } from "winston";

const fileFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

const consoleFormat = format.combine(
  format.errors({ stack: true }),
  format.colorize(),
  format.timestamp(),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const base = `[${timestamp}] ${level}: ${message}`;
    const extra = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return base + extra;
  })
);

export const logger = createLogger({
  level: "info",
  format: consoleFormat,
  transports: [
    new transports.Console({
      // format: consoleFormat,
    }),
    new transports.File({ filename: "logs/error.log", level: "error", format: fileFormat }),
    new transports.File({ filename: "logs/combined.log", format: fileFormat }),
  ],
});
