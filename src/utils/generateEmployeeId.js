import EmployeeCounter from "../models/EmployeeCounter.js";

export const generateEmployeeId = async (department, code) => {
  const counter = await EmployeeCounter.findOneAndUpdate(
    { department },
    {
      $inc: { sequence: 1 },
      $setOnInsert: {
        code,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  const number = String(counter.sequence).padStart(3, "0");

  return `${counter.code}-${number}`;
};