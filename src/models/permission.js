import { Schema, model } from "mongoose";

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false, // Exclude __v
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
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
const Permission = model("Permission", permissionSchema);
export default Permission;
