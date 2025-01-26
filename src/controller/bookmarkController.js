import { getSocketInstance } from "../../socket.js";
import Blog from "../models/blogs.js";
import { User } from "../models/users.js";
import asyncHandler from "../utils/asycnHandler.js";
const bookmarkBlog = asyncHandler(async (req, res, next) => {
  const blogId = req.params.id;
  const userId = req.user._id;
  // find blog and user
  const [user, blog] = await Promise.all([
    User.findById(userId),
    Blog.findById(blogId),
  ]);
  if (!blog) {
    return next(new Error("Blog not found"));
  }
  const isBookmarked = user.bookmarkedBlogs.includes(blogId);
  if (isBookmarked) {
    user.bookmarkedBlogs.pull(blogId);
    blog.bookmarkedBy.pull(userId);
  } else {
    user.bookmarkedBlogs.push(blogId);
    blog.bookmarkedBy.push(userId);
  }
  await Promise.all([user.save(), blog.save()]);
  // emit to cient side.
  const io = getSocketInstance();
  io.to(`blog-${blogId}`).emit("bookmark", {
    blogId,
    userId,
    isBookmarked: !isBookmarked,
  });

  res.status(200).json({
    status: "success",
    data: {
      bookmarkedBlogs: user.bookmarkedBlogs,
    },
  });
});
// get bookmark status for the blog
const getBookmarkStatus = asyncHandler(async (req, res, next) => {
  const blogId = req.params.id;
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new Error("User not found"));
  }
  const isBookmarked = user.bookmarkedBlogs.includes(blogId);
  res.status(200).json({
    status: "success",
    data: {
      isBookmarked,
    },
  });
});
// get all bookmarked blog by user
const getBookmarkedBlogs = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate({
    path: "bookmarkedBlogs",
    select: "title createdAt slug image",
  });
  if (!user) {
    return next(new Error("User not found"));
  }
  res.status(200).json({
    status: "success",
    data: {
      bookmarkedBlogs: user.bookmarkedBlogs,
    },
  });
});
const unbookmarkBlog = asyncHandler(async (req, res, next) => {
  const blogId = req.params.id;
  const userId = req.user._id;
  // find blog and user
  const [user, blog] = await Promise.all([
    User.findById(userId),
    Blog.findById(blogId),
  ]);
  if (!blog) {
    return next(new Error("Blog not found"));
  }
  const isBookmarked = user.bookmarkedBlogs.includes(blogId);
  if (isBookmarked) {
    user.bookmarkedBlogs.pull(blogId);
    blog.bookmarkedBy.pull(userId);
    await Promise.all([user.save(), blog.save()]);
    // emit to client side
    const io = getSocketInstance();
    io.to(`blog-${blogId}`).emit("unbookmark", {
      blogId,
      userId,
    });
    res.status(200).json({
      status: "success",
      data: {
        bookmarkedBlogs: user.bookmarkedBlogs,
      },
    });
  } else {
    return next(new Error("Blog is not bookmarked"));
  }
});
export { bookmarkBlog, getBookmarkStatus, getBookmarkedBlogs, unbookmarkBlog };
