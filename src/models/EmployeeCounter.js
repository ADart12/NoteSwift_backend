import mongoose from "mongoose";

const employeeCounterSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
    },

    sequence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EmployeeCounter", employeeCounterSchema);