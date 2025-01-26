import express from "express";
import { restrictTo } from "../controller/authController.js";
import {
  createRole,
  getAllPermissions,
  addPermissionToRole,
  addPermission,
  getAllRoles,
} from "../controller/rbacController.js";
import { protect } from "../middleware/authMIddleware.js";
const router = express.Router();
router.use(protect);
router.get("/permission", restrictTo("superAdmin"), getAllPermissions);
router.get("/role", getAllRoles);
router.post(
  "/role/:roleId/permissions",
  restrictTo("superAdmin"),
  addPermissionToRole
);
router.post("/role", createRole);
router.post("/permission", restrictTo("superAdmin"), addPermission);
export default router;

// RBAC
/**
 * @swagger
 * tags:
 *   name: RBAC
 *   description: Role-Based Access Control management
 */

/**
 * @swagger
 * /api/admin/permission:
 *   get:
 *     summary: Get all permissions
 *     tags: [RBAC]
 *     description: Retrieve a list of all permissions.
 *     operationId: getAllPermissions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The permission ID
 *                   name:
 *                     type: string
 *                     description: The name of the permission
 */

/**
 * @swagger
 * /api/admin/roles/{roleId}/permissions:
 *   post:
 *     summary: Add permissions to a role
 *     tags: [RBAC]
 *     description: Add one or more permissions to a specific role.
 *     operationId: addPermissionToRole
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of permission IDs to add to the role
 *     responses:
 *       200:
 *         description: Permissions added to role successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Permission added to role successfully
 *                 role:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The role ID
 *                     name:
 *                       type: string
 *                       description: The name of the role
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: An array of permission IDs
 *       400:
 *         description: Some permissions do not exist
 *       404:
 *         description: Role not found
 */

/**
 * @swagger
 * /api/admin/role:
 *   post:
 *     summary: Create a new role
 *     tags: [RBAC]
 *     description: Create a new role in the system.
 *     operationId: createRole
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the role
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The role ID
 *                 name:
 *                   type: string
 *                   description: The name of the role
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: An array of permission IDs
 *       400:
 *         description: Invalid input data
 */
