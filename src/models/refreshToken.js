import { model, Schema } from "mongoose";

const refreshTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deviceInfo: { type: String },
  IPAddress: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60, //   automatically expire the token after 30 days
  },
  expiredAt: {
    type: Date,
    required: true,
  },
});
const RefreshToken = model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
