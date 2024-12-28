import { model, Schema } from "mongoose";
const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
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
const Role = model("Role", roleSchema);
export default Role;
