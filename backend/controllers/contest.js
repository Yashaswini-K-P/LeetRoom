const getContestStatus = (startTime, endTime) => {
  if (!startTime || !endTime) return "Ongoing";

  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) {
    return "upcoming";
  } else if (now >= start && now <= end) {
    return "Ongoing";
  } else {
    return "Ended";
  }
};

module.exports = {
  getContestStatus,
};
