import Blog from "../models/blogs.js";
import { updateOne, deleteOne } from "./factoryHandler.js";
import asyncHandler from "../utils/asycnHandler.js";
import { client } from "../config/redis.js";

const createBlog = asyncHandler(async (req, res, next) => {
  const {
    title,
    content,
    category,
    tags,
    summary,
    image,
    isPublished,
    isDraft,
  } = req.body;
  const author = req.user._id;

  const blog = await Blog.create({
    title,
    content,
    category,
    tags,
    summary,
    image,
    isPublished,
    isDraft,
    author,
  });

  res.status(201).json({
    status: "success",
    data: blog.toJSON(),
  });
});

const updateBlog = updateOne(Blog);
const deleteBlog = deleteOne(Blog);
const getAllBlogs = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    title,
    tags,
    content,
    category,
    author,
  } = req.query;
  const query = {};
  if (title) query.title = { $regex: title, $options: "i" };
  // split tags(if we have multiple tags)
  if (tags) query.tags = { $in: tags.split(",") };
  if (content) query.content = { $regex: content, $options: "i" };
  if (category) query.category = category;
  if (author) query.author = author;
  const blogs = await Blog.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("author", "firstName lastName");
  const totalBlog = await Blog.countDocuments(query);
  res.status(200).json({
    status: "success",
    data: blogs.map((blog) => ({
      ...blog.toJSON(),
      totalBookmarks: blog.bookmarkedBy.length,
    })),
    pagination: {
      totalBlog,
      currentPage: Number(page),
      totalPage: Math.ceil(totalBlog / limit),
    },
  });
});
// getAll(Blog, ["author", "comments", "likes"]);
const getBlogBySlug = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate("author", "firstName lastName")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    });
  if (!blog) {
    return next(new Error("Blog not found"));
  }
  res.status(200).json({
    status: "success",
    data: {
      ...blog.toJSON(),
      totalBookmarks: blog.bookmarkedBy.length,
    },
  });
});
const incrementView = asyncHandler(async (req, res, next) => {
  const userIp = req.ip;
  const blogId = req.params.id;
  const viewKey = `view:${blogId}:${userIp}`; //  unique key for the blogId and userIp combination

  const hasViewed = await client.get(viewKey);
  if (hasViewed) {
    return res.status(200).json({
      status: "success",
      data: { message: "Already viewed" },
    });
  }

  const blog = await Blog.findByIdAndUpdate(
    blogId,
    { $inc: { views: 1 } },
    { new: true }
  );

  // Store the combination of blogId and userIp in Redis to mark the blog as viewed by this user
  await client.setEx(viewKey, 3600, "viewed"); // Cache the key for 1 hour (3600 seconds)

  if (!blog) {
    return next(new Error("Blog not found"));
  }

  res.status(200).json({
    status: "success",
    data: { views: blog.views },
  });
});
const recentPosts = asyncHandler(async (req, res, next) => {
  const { limit = 2 } = req.query;
  const recentBlogs = await Blog.find({})
    .sort({ publishedAt: -1 })
    .limit(Number(limit))
    .select("title createdAt slug image");
  // .populate("author", "firstName lastName");

  res.status(200).json({
    status: "success",
    data: recentBlogs.map((blog) => blog.toJSON()),
  });
});

export {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getBlogBySlug,
  incrementView,
  recentPosts,
};
