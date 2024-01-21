import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const TIMEZONE: string = process.env.MONGOLOQUENT_TIMEZONE || "Asia/Jakarta";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault(TIMEZONE);

export default dayjs;
