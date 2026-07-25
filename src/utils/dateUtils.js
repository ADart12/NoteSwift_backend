import NepaliDateModule from "nepali-date-converter";


const NepaliDate = NepaliDateModule.default;

export const nepaliDate = (date = new Date()) => {
  const bs = new NepaliDate(date);

  return `${bs.getYear()}-${String(bs.getMonth() + 1).padStart(2, "0")}-${String(bs.getDate()).padStart(2, "0")}`;
};


export const calculateLateStatus = (officeStartTime, gracePeriod) => {
  const now = new Date();

  const [startHour, startMinute] = officeStartTime
    .split(":")
    .map(Number);

  const officeStart = new Date(now);
  officeStart.setHours(startHour, startMinute, 0, 0);

  const allowedTime = new Date(
    officeStart.getTime() + gracePeriod * 60 * 1000
  );

  const isLate = now > allowedTime;

  const lateMinutes = isLate
    ? Math.floor((now.getTime() - officeStart.getTime()) / (1000 * 60))
    : 0;

  return {
    now,
    isLate,
    lateMinutes,
  };
};


export const calculateCheckoutDetails = (checkIn, officeEndTime) => {
  const now = new Date();

  // Working Hours
  const workedMilliseconds =
    now.getTime() - new Date(checkIn).getTime();

  const workingHours = Number(
    (workedMilliseconds / (1000 * 60 * 60)).toFixed(2)
  );

  // Office End Time
  const officeEnd = new Date(now);

  const [hour, minute] = officeEndTime
    .split(":")
    .map(Number);

  officeEnd.setHours(hour, minute, 0, 0);

  // Overtime
  let overtime = 0;

  if (now > officeEnd) {
    overtime = Number(
      (
        (now.getTime() - officeEnd.getTime()) /
        (1000 * 60 * 60)
      ).toFixed(2)
    );
  }

  return {
    now,
    workingHours,
    overtime,
  };
};


export const getDateRange = (range = "1w") => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);

  switch (range) {
    case "1m":
      startDate.setMonth(startDate.getMonth() - 1);
      break;

    case "3m":
      startDate.setMonth(startDate.getMonth() - 3);
      break;

    case "1w":
    default:
      startDate.setDate(startDate.getDate() - 7);
      break;
  }

  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
};