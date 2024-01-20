const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

const TIMEZONE = process.env.MONGOLOQUENT_TIMEZONE || "Asia/Jakarta";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault(TIMEZONE);

module.exports = dayjs;
