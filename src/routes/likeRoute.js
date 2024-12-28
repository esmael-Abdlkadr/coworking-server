import express from "express";
import { protect } from "../controller/authController.js";
import {
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
} from "../controller/likeController.js";
const router = express.Router();

/**
 * @swagger
 * /api/like:
 *   post:
 *     summary: Add a like
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to like
 *     responses:
 *       201:
 *         description: Like added successfully
 *       400:
 *         description: You have already reacted to this blog
 *
 * /api/like/{id}:
 *   delete:
 *     summary: Remove a like or dislike
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to remove reaction
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [like, dislike]
 *         description: The type of reaction to remove
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *       400:
 *         description: You have not reacted to this blog
 *
 * /api/like/dislike:
 *   post:
 *     summary: Add a dislike
 *     tags: [Dislikes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to dislike
 *     responses:
 *       201:
 *         description: Dislike added successfully
 *       400:
 *         description: You have already reacted to this blog
 *
 * /api/like/anonymous:
 *   post:
 *     summary: Add a reaction anonymously
 *     tags: [Likes]
 *     parameters:
 *       - in: body
 *         name: reaction
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             blogId:
 *               type: string
 *               description: The ID of the blog to react to
 *             type:
 *               type: string
 *               enum: [like, dislike]
 *               description: The type of reaction
 *     responses:
 *       201:
 *         description: Reaction added successfully
 *       400:
 *         description: You have already reacted to this blog
 *
 * /api/like/stats:
 *   get:
 *     summary: Get reaction statistics
 *     tags: [Likes]
 *     responses:
 *       200:
 *         description: Reaction statistics
 *
 * /api/like/blog/{id}:
 *   get:
 *     summary: Get blog with reactions
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog
 *     responses:
 *       200:
 *         description: Blog with reactions
 *
 * /api/like/blog/{blogId}/reactions:
 *   get:
 *     summary: Get all reactions for a blog
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog
 *     responses:
 *       200:
 *         description: List of reactions for the blog
 *       404:
 *         description: No reactions found for this blog
 *
 * /api/like/blog/{blogId}/user-reaction:
 *   get:
 *     summary: Get the current user's reaction on a blog
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog
 *     responses:
 *       200:
 *         description: User's reaction on the blog
 *       404:
 *         description: No reaction found for this blog by the current user
 *
 * /api/like/comment/{commentId}:
 *   post:
 *     summary: Add or update a reaction to a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to react to
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [like, dislike]
 *         description: The type of reaction
 *     responses:
 *       201:
 *         description: Reaction added or updated successfully
 *       400:
 *         description: Invalid request
 *   delete:
 *     summary: Remove a reaction from a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to remove reaction from
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *       404:
 *         description: Reaction not found
 */

router.route("/").post(protect, addLike);
router.route("/:id").delete(protect, removReaction);
router.route("/dislike").post(protect, addDislike);
router.route("/anonymous").post(addReactionForAnonymous);
router.route("/stats").get(getReactionStats);
router.route("/blog/:id").get(getBlogWithReactions);
router.route("/blog/:blogId/reactions").get(getReactionsForBlog);
router.route("/blog/:blogId/user-reaction").get(protect, getUserReactionOnBlog);
router
  .route("/comment/:commentId")
  .post(protect, commentReactions)
  .delete(protect, removeCommentReaction);

export default router;
