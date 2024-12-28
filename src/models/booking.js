import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: String,
      required: [true, "Please provide the price of the service"],
      min: [0, "Price must be greater than 0"],
    },
    status: {
      type: String,
      enum: ["pending", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);

bookingSchema.index(
  { service: 1, bookingDate: 1, startTime: 1, endTime: 1, status: 1 },
  { unique: true }
);

const Booking = model("Booking", bookingSchema);
export default Booking;
