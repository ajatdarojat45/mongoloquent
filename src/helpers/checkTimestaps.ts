import dayjs from "../utils/dayjs";
const TIMEZONE: string = process.env.MONGOLOQUENT_TIMEZONE || "Asia/Jakarta";

function checkTimestamps(timestamps: boolean, payload: object): object {
  if (timestamps) {
    const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
    const now = dayjs.utc(current).tz(TIMEZONE).toDate();

    return { ...payload, createdAt: now, updatedAt: now };
  }

  return payload;
}

export default checkTimestamps;
