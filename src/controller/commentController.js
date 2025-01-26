import Comment from "../models/comment.js";
import Blog from "../models/blogs.js";
import asyncHandler from "../utils/asycnHandler.js";
import { getAll } from "./factoryHandler.js";
import { getSocketInstance } from "../../socket.js";
const addComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) return next(new Error("Blog not found"));
  const newComment = new Comment({
    content,
    blog: req.params.blogId,
    user: req.user._id,
  });
  const savedComment = await newComment.save();

  // Populate user details
  await savedComment.populate("user", "firstName lastName");
  blog.comments.push(savedComment._id);
  await blog.save();
  // Emit the populated comment to clients
  const io = getSocketInstance();
  io.to(`blog-${req.params.blogId}`).emit("newComment", {
    id: savedComment._id.toString(),
    content: savedComment.content,
    createdAt: savedComment.createdAt,
    user: {
      firstName: savedComment.user.firstName,
      lastName: savedComment.user.lastName,
      id: savedComment.user._id.toString(),
    },
  });

  res.status(201).json({
    id: savedComment._id.toString(),
    content: savedComment.content,
    createdAt: savedComment.createdAt,
    user: {
      firstName: savedComment.user.firstName,
      lastName: savedComment.user.lastName,
      id: savedComment.user._id.toString(),
    },
  });
});

const getAllComments = getAll(Comment, ["user"]);
const getCommentByBlogId = asyncHandler(async (req, res, next) => {
  const { blogId } = req.params;

  // Fetch all comments for the blog
  const comments = await Comment.find({ blog: blogId, status: "active" })
    .populate("user", "firstName lastName")
    .lean({ virtuals: true });

  if (!comments.length) {
    return res.status(200).json({
      status: "success",
      data: [],
    });
  }
  const transformComments = (comments) => {
    return comments.map((comment) => ({
      ...comment,
      id: comment._id.toString(),
      // totalReply: comment.replies.length, // Include totalReply
      replies: transformComments(comment.replies || []),
    }));
  };

  const transformedComments = transformComments(comments);

  // Function to build nested structure
  const buildNestedComments = (parentId = null) => {
    return transformedComments
      .filter((comment) =>
        parentId === null
          ? !comment.parent // For root-level comments
          : comment.parent?.toString() === parentId
      )
      .map((comment) => ({
        ...comment,
        replies: buildNestedComments(comment.id),
      }));
  };

  const nestedComments = buildNestedComments();

  res.status(200).json({
    status: "success",
    data: nestedComments,
  });
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new Error("Comment not found"));

  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new Error("You do not have permission to delete this comment"));
  }

  comment.status = "deleted";
  await comment.save();

  const io = getSocketInstance();
  console.log("Emitting deleteComment event", { id: comment._id });
  io.to(`blog-${comment.blog}`).emit("deleteComment", { id: comment._id });

  res.status(204).json({ status: "success", data: null });
});

const editComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new Error("Comment not found"));

  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new Error("You do not have permission to edit this comment"));
  }

  comment.content = content;
  comment.editedAt = Date.now();
  await comment.save();

  const io = getSocketInstance();
  console.log("Emitting editComment event", {
    id: comment._id,
    content: comment.content,
    editedAt: comment.editedAt,
  });
  io.to(`blog-${comment.blog}`).emit("editComment", {
    id: comment._id,
    content: comment.content,
    editedAt: comment.editedAt,
  });

  res.status(200).json({ status: "success", data: comment });
});

const addreply = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const userId = req.user._id;
  // check if the parent comment exist.
  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    return next(new Error("Comment not found"));
  }
  // create new reply.
  const reply = new Comment({
    content,
    blog: parentComment.blog, // Same blog as the parent comment
    user: userId,
    parent: commentId, // Reference to the parent comment
  });
  const saveReply = await reply.save();
  //  add reply to prent replies array
  parentComment.replies.push(saveReply._id);
  await parentComment.save();
  // populate user details
  await saveReply.populate("user", "firstName lastName");
  res.status(201).json({
    id: saveReply._id.toString(),
    content: saveReply.content,
    createdAt: saveReply.createdAt,
    user: {
      firstName: saveReply.user.firstName,
      lastName: saveReply.user.lastName,
      id: saveReply.user._id.toString(),
    },
  });
});
const getNestedComments = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  // Step 1: Get all comments for the blog
  const comments = await Comment.find({ blog: blogId })
    .populate("user", "firstName lastName id")
    .lean(); // Use lean for performance

  // Step 2: Create a map of comments by their ID
  const commentMap = {};
  comments.forEach((comment) => {
    comment.replies = []; // Initialize empty replies array
    commentMap[comment._id] = comment;
  });

  // Step 3: Build the nested structure
  const nestedComments = [];
  comments.forEach((comment) => {
    if (comment.parent) {
      // If the comment has a parent, push it into the parent's replies
      commentMap[comment.parent].replies.push(comment);
    } else {
      // Otherwise, it's a top-level comment
      nestedComments.push(comment);
    }
  });
  res.status(200).json({
    status: "success",
    data: nestedComments,
  });
});

const getTotalCommentsForBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId } = req.params;
    const totalComments = await Comment.countDocuments({ blog: blogId });
    res.status(200).json({ totalComments });
  } catch (error) {
    res.status(500).json({ message: "Failed to get total comments", error });
  }
});

export {
  addComment,
  getAllComments,
  getCommentByBlogId,
  deleteComment,
  editComment,
  addreply,
  getNestedComments,
  getTotalCommentsForBlog,
};
