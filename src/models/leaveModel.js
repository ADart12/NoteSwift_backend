import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    leaveType: {
      type: String,
      enum: [
        "Casual",
        "Sick",
        "Earned",
        "Emergency",
        "Maternity",
        "Paternity",
        "Unpaid",
        "Other",
      ],
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    days: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Leave", leaveSchema);