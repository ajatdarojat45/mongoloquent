import { TIMEZONE } from "../constants";
import djs from "dayjs";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

djs.extend(utc);
djs.extend(timezone);
djs.tz.setDefault(TIMEZONE);

export function getDayjs(tz?: string) {
	djs.extend(utc);
	djs.extend(timezone);

	const _tz = tz ? tz : TIMEZONE;

	djs.tz.setDefault(_tz);
}

export const dayjs = djs;
