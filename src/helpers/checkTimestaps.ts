import dayjs from "../utils/dayjs";

function checkTimestamps(timestamps: boolean, payload: object): object {
  if (timestamps) {
    const now = dayjs().toDate();
    return { ...payload, createdAt: now, updatedAt: now };
  }

  return payload;
}

export default checkTimestamps;
