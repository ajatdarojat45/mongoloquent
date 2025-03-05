import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TIME_ZONE } from "../configs/app";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TIME_ZONE);

export function getDayjs(tz?: string) {
  dayjs.extend(utc);
  dayjs.extend(timezone);

  const _tz = tz ? tz : TIME_ZONE

  dayjs.tz.setDefault(_tz);
}


export default dayjs;
