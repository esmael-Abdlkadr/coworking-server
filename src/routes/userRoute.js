import express from "express";
import { restrictTo } from "../controller/authController.js";
import {
  assignRoleToUser,
  confirmEmailChange,
  deleteme,
  getAllUser,
  getUser,
  getUserByEmail,
  myInfo,
  requestEmailUpdate,
  updateMe,
} from "../controller/userController.js";
import { protect } from "../middleware/authMIddleware.js";

const router = express.Router();
router.patch("/updateMe", protect, updateMe);
router.get("/me", protect, myInfo);
router.patch("/deleteMe", protect, deleteme);
router.get("/allUser", protect, getAllUser);
router.get("/:id", protect, getUser);
router.post("/requestEmailChange", requestEmailUpdate);
router.get("/confirmEmailChange", confirmEmailChange);
router.get("/userByEmail/:email", protect, getUserByEmail);
router.patch(
  "/:userId/role",
  protect,
  restrictTo("superAdmin"),
  assignRoleToUser
);

export default router;
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/user/updateMe:
 *   patch:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User information updated successfully
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/deleteMe:
 *   patch:
 *     summary: Deactivate current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User account deactivated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/allUser:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/user/requestEmailChange:
 *   post:
 *     summary: Request email change
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email change request sent successfully
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /api/user/confirmEmailChange:
 *   get:
 *     summary: Confirm email change
 *     tags: [Users]
 *     parameters:
 *       - name: token
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Confirmation token
 *     responses:
 *       200:
 *         description: Email change confirmed successfully
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/user/userByEmail/{email}:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user to retrieve
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/user/{userId}/role:
 *   patch:
 *     summary: Assign role to user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to assign role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *                 description: ID of the role to assign
 *     responses:
 *       200:
 *         description: Role assigned to user successfully
 *       404:
 *         description: User or role not found
 */
