import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    location: { type: String, default: "Dhaka, Bangladesh" },
  },
  { collection: "users" }
);

export default mongoose.model("User", userSchema);
