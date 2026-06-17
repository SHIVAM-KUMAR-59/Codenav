import { addColors, createLogger, format, Logger, transports } from "winston";

const { combine, printf, timestamp, errors } = format;

const customLevels = {
  levels: {
    error: 0,
    success: 1,
    info: 2,
    debug: 3,
  },

  colors: {
    error: "bold red",
    success: "bold green",
    info: "bold blue",
    debug: "bold yellow",
  },
} as const;

addColors(customLevels.colors);

const getISTTimestamp = (): string => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
};

const colorizer = format.colorize();

const logFormat = printf(({ timestamp, level, message, stack }) => {
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;

  return colorizer.colorize(level, formattedMessage);
});

const consoleFormat = combine(
  timestamp({
    format: getISTTimestamp,
  }),

  errors({
    stack: true,
  }),

  logFormat
);

const fileFormat = combine(
  timestamp({
    format: getISTTimestamp,
  }),

  errors({
    stack: true,
  }),

  printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message}`;
  })
);

export interface ILogger extends Logger {
  success: (message: string) => void;
}

const baseLogger = createLogger({
  levels: customLevels.levels,

  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  silent: process.env.NODE_ENV === "test",

  transports: [
    new transports.Console({
      format: consoleFormat,
    }),

    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),

    new transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    }),
  ],
});

export const logger: ILogger = Object.assign(baseLogger, {
  success(message: string) {
    return baseLogger.log("success", message);
  },
});
