import { TIMEZONE } from "../configs/app";
import dayjs from "dayjs";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TIMEZONE);

export function getDayjs(tz?: string) {
  dayjs.extend(utc);
  dayjs.extend(timezone);

  const _tz = tz ? tz : TIMEZONE;

  dayjs.tz.setDefault(_tz);
}

export default dayjs;
