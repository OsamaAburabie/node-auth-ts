import logger from "pino";
import dayjs from "dayjs";
import congfig from "config";

const level = congfig.get<string>("logLevel");

const log = logger({
  transport: {
    target: "pino-pretty",
  },
  level,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default log;
