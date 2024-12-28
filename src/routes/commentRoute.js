import express from "express";
import { protect } from "../controller/authController.js";
import {
  addComment,
  getCommentByBlogId,
  getAllComments,
  deleteComment,
  editComment,
  addreply,
  getNestedComments,
  getTotalCommentsForBlog,
} from "../controller/commentController.js";

const router = express.Router();

router.route("/").get(getAllComments);
router.route("/:blogId").post(protect, addComment).get(getCommentByBlogId);
router.route("/:id").patch(protect, editComment).delete(protect, deleteComment);
router.route("/:commentId/replies").post(protect, addreply);
router.route("/:blogId/nested").get(getNestedComments);
router.route("/totalComments/:blogId").get(getTotalCommentsForBlog);
export default router;

// Comments
/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management
 */

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     description: Get all comments from the database.
 *     operationId: getAllComments
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID of the comment
 *                   blog:
 *                     type: string
 *                     description: ID of the blog
 *                   content:
 *                     type: string
 *                     description: The content of the comment
 *                   user:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 */

/**
 * @swagger
 * /api/comments/{blogId}:
 *   post:
 *     summary: Add a new comment
 *     tags: [Comments]
 *     description: Add a new comment entry in the database.
 *     operationId: addComment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: blogId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *                 example: "This is a comment"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get comments by blog ID
 *     tags: [Comments]
 *     description: Retrieve comments by blog ID.
 *     operationId: getCommentByBlogId
 *     parameters:
 *       - name: blogId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the blog
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID of the comment
 *                   blog:
 *                     type: string
 *                     description: ID of the blog
 *                   content:
 *                     type: string
 *                     description: The content of the comment
 *                   user:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *       404:
 *         description: Comments not found
 */

/**
 * @swagger
 * /api/comments/{id}:
 *   patch:
 *     summary: Edit a comment
 *     tags: [Comments]
 *     description: Edit a comment by its ID.
 *     operationId: editComment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *                 example: "This is an edited comment"
 *     responses:
 *       200:
 *         description: Comment edited successfully
 *       404:
 *         description: Comment not found
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     description: Delete a comment by its ID.
 *     operationId: deleteComment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   post:
 *     summary: Add a reply to a comment
 *     tags: [Comments]
 *     description: Add a reply to a specific comment.
 *     operationId: addReply
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the parent comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the reply
 *                 example: "This is a reply"
 *     responses:
 *       201:
 *         description: Reply created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/comments/{blogId}/nested:
 *   get:
 *     summary: Get nested comments by blog ID
 *     tags: [Comments]
 *     description: Retrieve nested comments by blog ID.
 *     operationId: getNestedComments
 *     parameters:
 *       - name: blogId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the blog
 *     responses:
 *       200:
 *         description: Nested comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID of the comment
 *                   blog:
 *                     type: string
 *                     description: ID of the blog
 *                   content:
 *                     type: string
 *                     description: The content of the comment
 *                   user:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                   replies:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         content:
 *                           type: string
 *                         user:
 *                           type: object
 *                           properties:
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *       404:
 *         description: Comments not found
 */

/**
 * @swagger
 * /api/comments/totalComments/{blogId}:
 *   get:
 *     summary: Get total comments for a blog
 *     tags: [Comments]
 *     description: Retrieve the total number of comments for a specific blog.
 *     operationId: getTotalCommentsForBlog
 *     parameters:
 *       - name: blogId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the blog
 *     responses:
 *       200:
 *         description: Total comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalComments:
 *                   type: integer
 *                   description: Total number of comments
 *       500:
 *         description: Failed to get total comments
 */
