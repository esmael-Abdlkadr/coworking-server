import { Schema, model } from "mongoose";
import leanVirtuals from "mongoose-lean-virtuals";

const commentSchema = new Schema(
  {
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    editedAt: {
      type: Date,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    dislikeCount: {
      type: Number,
      default: 0,
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
    virtuals: true, // Ensure virtuals are included
  }
);

commentSchema.virtual("totalReply").get(function () {
  return this.replies.length;
});

commentSchema.plugin(leanVirtuals);

const Comment = model("Comment", commentSchema);
export default Comment;
