import express from "express";
import { protect, restrictTo } from "../controller/authController.js";
import {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  incrementView,
  getBlogBySlug,
} from "../controller/blogController.js";
const router = express.Router();
router.route("/").get(getAllBlogs).post(protect, createBlog);
router.get("/:slug", getBlogBySlug);
router
  .route("/:id")
  .patch(protect, restrictTo("admin"), updateBlog)
  .delete(protect, restrictTo("admin"), deleteBlog);
router.put("/incrementView/:id", incrementView); // Remove protect and restrictTo for public access
export default router;

// BLOGS.
/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management
 */
// CREATE BLOG.
/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     description: Creates a new blog entry in the database.
 *     operationId: createBlog
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the blog
 *                 example: "My First blog"
 *               content:
 *                 type: string
 *                 description: Content of the blog
 *                 example: "This is the content of my first blog."
 *               author:
 *                 type: string
 *                 description: ID of the author
 *                 example: "60d0fe4f5311236168a109ca"
 *               category:
 *                 type: string
 *                 description: Category of the blog
 *                 example: "Technology"
 *               image:
 *                 type: string
 *                 description: Image URL of the blog
 *                 example: "http://example.com/image.jpg"
 *               summary:
 *                 type: string
 *                 description: Summary of the blog
 *                 example: "This is a summary of my first blog."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the blog
 *                 example: ["tech", "coding"]
 *               isPublished:
 *                 type: boolean
 *                 description: Publish status of the blog
 *                 example: true
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Publish date of the blog
 *                 example: "2023-10-01T00:00:00.000Z"
 *     responses:
 *       '201':
 *         description: blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/blog'
 *       '400':
 *         description: Invalid input data
 */
// UPDATE A BLOG BY ID.
/**
 * @swagger
 * /api/blog/{id}:
 *   patch:
 *     summary: Update a blog by ID
 *     tags: [Blogs]
 *     description: Updates details of a specific blog by ID.
 *     operationId: updateBlog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the blog
 *                 example: "Updated blog Title"
 *               content:
 *                 type: string
 *                 description: Content of the blog
 *                 example: "This is the updated content of the blog."
 *               author:
 *                 type: string
 *                 description: ID of the author
 *                 example: "60d0fe4f5311236168a109ca"
 *               category:
 *                 type: string
 *                 description: Category of the blog
 *                 example: "Health"
 *               image:
 *                 type: string
 *                 description: Image URL of the blog
 *                 example: "http://example.com/updated-image.jpg"
 *               summary:
 *                 type: string
 *                 description: Summary of the blog
 *                 example: "This is an updated summary of the blog."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for the blog
 *                 example: ["health", "wellness"]
 *               isPublished:
 *                 type: boolean
 *                 description: Publish status of the blog
 *                 example: true
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Publish date of the blog
 *                 example: "2023-10-01T00:00:00.000Z"
 *     responses:
 *       '200':
 *         description: blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/blog'
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: blog not found
 */

// GET ALL BLOGS.
/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     description: Retrieves a list of all available blogs.
 *     operationId: getAllBlogs
 *     responses:
 *       '200':
 *         description: List of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/blog'
 *       '500':
 *         description: Server error
 */
// GET A BLOG BY SLUG.
/**
 * @swagger
 * /api/blog/{slug}:
 *   get:
 *     summary: Get a blog by slug
 *     tags: [Blogs]
 *     description: Retrieves details of a specific blog by slug.
 *     operationId: getBlogBySlug
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique slug of the blog
 *     responses:
 *       '200':
 *         description: blog details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/blog'
 *       '404':
 *         description: blog not found
 */

// DELETE A BLOG BY ID.
/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete a blog by ID
 *     tags: [Blogs]
 *     description: Deletes a specific blog by ID.
 *     operationId: deleteBlog
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the blog
 *     responses:
 *       '204':
 *         description: blog deleted successfully
 *       '404':
 *         description: blog not found
 */
// INCREMENT VIEW.
/**
 * @swagger
 * /api/blog/incrementView/{id}:
 *   put:
 *     summary: Increment view by ID
 *     tags: [Blogs]
 *     description: Increments the view count of a specific blog by ID.
 *     operationId: incrementView
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the blog
 *     responses:
 *       '200':
 *         description: View count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/blog'
 *       '404':
 *         description: Blog not found
 */
