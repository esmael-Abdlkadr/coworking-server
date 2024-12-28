import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    //prevent creating new if for each review
    _id: false,
  }
);

const serviceSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    prichourlyRate: {
      type: String,
      required: [true, "Price is required"],
    },
    CardDefinition: {
      type: String,
      required: [true, "CardDefinition is required"],
    },

    amenities: {
      type: [String],
      required: [true, "Amenities is required"],
    },
    benefits: {
      type: [String],
      // required: [true, "Service benefits content is required"],
    },
    location: [String],
    slug: {
      type: String,
      unique: true,
    },
    images: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [reviewSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

serviceSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    // Generate slug from the title
    let slug = slugify(this.title, { lower: true, strict: true });

    // Ensure slug is unique by appending a counter if necessary
    let counter = 0;
    while (await Service.exists({ slug })) {
      counter++;
      slug = `${slug}-${counter}`;
    }

    this.slug = slug;
  }
  next();
});

const Service = mongoose.model("Service", serviceSchema);
export default Service;
