import { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: function () {
        return !this.comment;
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
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
      versionKey: false, // Exclude __v
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);
likeSchema.index({ blog: 1, user: 1, type: 1 }, { unique: true });
likeSchema.index({ comment: 1, user: 1, type: 1 }, { unique: true });

const Like = model("Like", likeSchema);
export default Like;
