import { model, Schema } from "mongoose";

const ImageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Image = model("Image", ImageSchema);
export default Image;
