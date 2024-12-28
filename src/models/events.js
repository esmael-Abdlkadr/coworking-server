import { Schema, model } from "mongoose";
const eventSchema = Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    images: {
      type: [String],
      // required: [true, "Image is required"],
    },
    // link: {
    //   type: String,
    //   // required: [true, "Link is required"],
    // },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      default: 100,
    },
    deleted: {
      type: Boolean,
      default: false,
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
const Event = model("Event", eventSchema);
export default Event;
