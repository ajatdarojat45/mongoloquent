const dayjs = require("../utils/dayjs");

function checkTimestamps(timestamps, payload) {
  if (timestamps) {
    const now = dayjs().toDate();
    return { ...payload, createdAt: now, updatedAt: now };
  }
}

module.exports = checkTimestamps;
