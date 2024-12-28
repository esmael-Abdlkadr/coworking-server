import { Schema, model } from "mongoose";

const reserveSpotSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["reserved", "cancelled", "waitlisted"],
      default: "reserved",
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false, // Exclude __v
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false, // Exclude __v
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);

const ReserveSpot = model("ReserveSpot", reserveSpotSchema);
export default ReserveSpot;
