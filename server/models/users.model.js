import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "cashier"], default: "cashier" }
  },
  { timestamps: true }
);

// Prevent model overwrite error
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;