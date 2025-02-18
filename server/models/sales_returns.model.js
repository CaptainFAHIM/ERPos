import mongoose from "mongoose";

const ReturnSchema = new mongoose.Schema(
  {
    transactionNo: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    returnQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    returnReason: {
      type: String,
      required: true,
    },
    refundedAmount: {
      type: Number,
      required: true,
    },
    returnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Return", ReturnSchema);
