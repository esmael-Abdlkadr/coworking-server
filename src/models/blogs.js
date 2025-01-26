import { Schema, model } from "mongoose";
import slugify from "slugify";
const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title can not be more than 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Technology",
        "Health",
        "Fashion",
        "Food",
        "Travel",
        "Sports",
        "Entertainment",
        "Education",
        "Business",
        "Lifestyle",
        "Politics",
        "Science",
        "Others",
      ],
    },
    image: {
      type: String,
      // required: [true, "Image is required"],
    },
    summary: {
      type: String,
      maxlength: [500, "Summary can not be more than 200 characters"],
    },
    tags: [{ type: String }],
    bookmarkedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    dislikeCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: true, // Blogs are drafts by default until explicitly published
    },
    readingTime: String,

    publishedAt: {
      type: Date,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,

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
// middleware to generate slug
blogSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    // Generate slug from the title
    let slug = slugify(this.title, { lower: true, strict: true });
    // Ensure slug is unique by appending a counter
    let counter = 0;
    while (await Blog.exists({ slug })) {
      counter++;
      slug = `${slug}-${counter}`;
    }

    this.slug = slug;
  }
  next();
});
// middleware to calculate readingtime
blogSchema.pre("save", function (next) {
  const wordsPerMinute = 200;
  const words = this.content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  this.readingTime = `${minutes} min read`; // Set the readingTime field
  next();
});
// Pre-remove middleware to delete associated likes and comments(Cascade delete)

blogSchema.pre("remove", async function (next) {
  await Like.deleteMany({ blog: this._id });
  await Comment.deleteMany({ blog: this._id });
  next();
});
// INDXES
blogSchema.index({ slug: 1, category: 1, publishedAt: -1, bookmarkedBy: 1 });

const Blog = model("Blog", blogSchema);
export default Blog;
