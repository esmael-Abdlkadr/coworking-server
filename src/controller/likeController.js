import Blog from "../models/blogs.js";
import Like from "../models/likes.js";
import asyncHandler from "../utils/asycnHandler.js";
import Comment from "../models/comment.js";
import { getSocketInstance } from "../../socket.js";

const addLike = asyncHandler(async (req, res, next) => {
  const blogId = req.query.blogId;
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return next(new Error("Blog not found"));
  }
  const existingReaction = await Like.findOne({
    blog: blogId,
    user: req.user._id,
  });
  if (existingReaction) {
    // Remove the existing reaction
    if (existingReaction.type === "dislike") {
      blog.dislikes = blog.dislikes.filter(
        (dislike) => dislike.toString() !== existingReaction._id.toString()
      );
    } else if (existingReaction.type === "like") {
      return res.status(400).json({
        status: "fail",
        message: "You have already liked this blog",
      });
    }
    await existingReaction.deleteOne();
  }
  const newLike = new Like({
    blog: blogId,
    user: req.user._id,
    type: "like",
  });
  const savedLike = await newLike.save();
  blog.likes.push(savedLike._id);
  await blog.save();
  res.status(201).json({
    status: "success",
    data: savedLike,
  });
});

const addDislike = asyncHandler(async (req, res, next) => {
  const blogId = req.query.blogId;
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return next(new Error("Blog not found"));
  }
  const existingReaction = await Like.findOne({
    blog: blogId,
    user: req.user._id,
  });
  // if user like before, remove the like.
  if (existingReaction) {
    // Remove the existing reaction
    if (existingReaction.type === "like") {
      blog.likes = blog.likes.filter(
        (like) => like.toString() !== existingReaction._id.toString()
      );
    } else if (existingReaction.type === "dislike") {
      return res.status(400).json({
        status: "fail",
        message: "You have already disliked this blog",
      });
    }
    await existingReaction.deleteOne();
  }
  const newDislike = new Like({
    blog: blogId,
    user: req.user._id,
    type: "dislike",
  });
  const savedDislike = await newDislike.save();
  blog.dislikes.push(savedDislike._id);
  await blog.save();
  res.status(201).json({
    status: "success",
    data: savedDislike,
  });
});

const getBlogWithReactions = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id)
    .populate("likes")
    .populate("dislikes");
  if (!blog) {
    return next(new Error("Blog not found"));
  }
  res.status(200).json({
    data: {
      blog,
      likeCount: blog.likes.length,
      dislikeCount: blog.dislikes.length,
    },
  });
});

const getUserReactionOnBlog = asyncHandler(async (req, res, next) => {
  const blogId = req.params.blogId;
  const reaction = await Like.findOne({
    blog: blogId,
    user: req.user._id,
  });

  if (!reaction) {
    return res.status(200).json({
      data: null,
    });
  }

  res.status(200).json({
    data: reaction,
  });
});

const getReactionsForBlog = asyncHandler(async (req, res, next) => {
  const blogId = req.params.blogId;
  const reactions = await Like.find({ blog: blogId }).populate(
    "user",
    "name email"
  );

  const likes = reactions.filter((reaction) => reaction.type === "like");
  const dislikes = reactions.filter((reaction) => reaction.type === "dislike");

  res.status(200).json({
    status: "success",
    data: {
      likes: {
        count: likes.length,
        users: likes,
      },
      dislikes: {
        count: dislikes.length,
        users: dislikes,
      },
    },
  });
});

const removReaction = asyncHandler(async (req, res, next) => {
  const blogId = req.params.id;
  const type = req.query.type;
  console.log(type);
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return next(new Error("Blog not found"));
  }
  const existingReactions = await Like.findOne({
    blog: blogId,
    user: req.user._id,
    type: type,
  });
  if (!existingReactions) {
    return res.status(400).json({
      status: "fail",
      message: `You have not ${
        type === "like" ? "liked" : "disliked"
      } this blog`,
    });
  }
  await existingReactions.deleteOne();
  if (type === "like") {
    blog.likes = blog.likes.filter(
      (like) => like.toString() !== existingReactions._id.toString()
    );
  } else {
    blog.dislikes = blog.dislikes.filter(
      (dislike) => dislike.toString() !== existingReactions._id.toString()
    );
  }

  await blog.save();
  res.status(200).json({
    status: "success",
    message: `${type} removed`,
  });
});

const addReactionForAnonymous = asyncHandler(async (req, res, next) => {
  const { blogId, type } = req.body;
  const ip = req.ip;
  const existingReaction = await Like.findOne({ blog: blogId, ip });
  const blog = await Blog.findById(blogId);
  if (existingReaction) {
    return res.status(400).json({
      status: "fail",
      message: "You have already reacted to this blog",
    });
  }

  const newReaction = new Like({
    blog: blogId,
    ip,
    type,
  });
  const savedReaction = await newReaction.save();
  if (type === "like") {
    blog.likeCount += 1;
  } else {
    blog.dislikeCount += 1;
  }

  await blog.save();
  res.status(201).json({
    status: "success",
    data: savedReaction,
  });
});

const getReactionStats = asyncHandler(async (req, res, next) => {
  const stats = await Like.aggregate([
    {
      $group: {
        _id: "$blog",
        likeCount: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
        dislikeCount: {
          $sum: { $cond: [{ $eq: ["$type", "dislike"] }, 1, 0] },
        },
      },
    },
    { $sort: { likeCount: -1 } },
  ]);
  res.status(200).json({
    status: "success",
    data: stats,
  });
});

const commentReactions = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  console.log("comment", commentId);
  const { type } = req.query;
  const userid = req.user._id;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new Error("Comment not found"));
  }
  const existingReaction = await Like.findOne({
    comment: commentId,
    user: userid,
  });
  const io = getSocketInstance();
  if (existingReaction) {
    if (existingReaction.type === type) {
      await existingReaction.deleteOne();
      if (type === "like") {
        comment.likeCount = Math.max(comment.likeCount - 1, 0);
      } else {
        comment.dislikeCount = Math.max(comment.dislikeCount - 1, 0);
      }
      await comment.save();
      io.to(`comment-${commentId}`).emit("reactionRemoved", {
        commentId,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
      });
      return res.status(200).json({
        status: "success",
        message: "Reaction removed",
      });
    }
    existingReaction.type = type;
    await existingReaction.save();
    if (type === "like") {
      comment.likeCount += 1;
      comment.dislikeCount = Math.max(comment.dislikeCount - 1, 0);
    } else {
      comment.likeCount = Math.max(comment.likeCount - 1, 0);
      comment.dislikeCount += 1;
    }
    await comment.save();
    io.to(`comment-${commentId}`).emit("reactionUpdated", {
      commentId,
      likeCount: comment.likeCount,
      dislikeCount: comment.dislikeCount,
      type,
    });
    return res.status(200).json({
      status: "success",
      data: existingReaction,
    });
  }
  const newReaction = new Like({
    comment: commentId,
    user: userid,
    type,
  });
  const savedReaction = await newReaction.save();
  if (type === "like") {
    comment.likeCount += 1;
  } else {
    comment.dislikeCount += 1;
  }
  console.log("saved reaction", savedReaction);
  await comment.save();
  io.to(`comment-${commentId}`).emit("newReaction", {
    commentId,
    likeCount: comment.likeCount,
    dislikeCount: comment.dislikeCount,
    type,
  });
  res.status(201).json({
    status: "success",
    data: savedReaction,
  });
});

const removeCommentReaction = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const userid = req.user._id;
  const existingReaction = await Like.findOne({
    comment: commentId,
    user: userid,
  });
  if (!existingReaction) {
    return res.status(404).json({
      status: "fail",
      message: "Reaction not found",
    });
  }
  await existingReaction.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Reaction removed",
  });
});

export {
  addLike,
  addDislike,
  removReaction,
  getBlogWithReactions,
  addReactionForAnonymous,
  getReactionStats,
  getReactionsForBlog,
  getUserReactionOnBlog,
  commentReactions,
  removeCommentReaction,
};
