import express from "express";
import { protect, restrictTo } from "../controller/authController.js";
import {
  createService,
  getAllServices,
  updateService,
  deleteService,
  getServiceBySlug,
} from "../controller/serviceController.js";

const router = express.Router();

router.route("/").get(getAllServices).post(protect, createService);
router.route("/:slug").get(getServiceBySlug);

router
  .route("/:id")
  .patch(protect, updateService)
  .delete(protect, deleteService);

export default router;

/**
 * @swagger
 * tags:
 *   - name: Services
 *     description: Service management
 */

/**
 * @swagger
 * /api/Service:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     description: Creates a new service entry in the database.
 *     operationId: createService
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
 *                 description: Name of the service
 *               description:
 *                 type: string
 *                 description: Description of the service
 *               price:
 *                 type: number
 *                 description: Price of the service
 *             required:
 *               - name
 *               - price
 *     responses:
 *       '201':
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       '400':
 *         description: Invalid input data
 */

/**
 * @swagger
 * /api/Service:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     description: Retrieves a list of all available services.
 *     operationId: getAllServices
 *     responses:
 *       '200':
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       '500':
 *         description: Server error
 */

/**
 * @swagger
 * /api/Service/{id}:
 *   get:
 *     summary: Get a service by ID
 *     tags: [Services]
 *     description: Retrieves details of a specific service by ID.
 *     operationId: getService
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the service
 *     responses:
 *       '200':
 *         description: Service details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       '404':
 *         description: Service not found
 */

/**
 * @swagger
 * /api/Service/{id}:
 *   patch:
 *     summary: Update a service by ID
 *     tags: [Services]
 *     description: Updates details of a specific service by ID.
 *     operationId: updateService
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the service
 *               description:
 *                 type: string
 *                 description: Description of the service
 *               price:
 *                 type: number
 *                 description: Price of the service
 *     responses:
 *       '200':
 *         description: Service updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: Service not found
 */

/**
 * @swagger
 * /api/Service/{id}:
 *   delete:
 *     summary: Delete a service by ID
 *     tags: [Services]
 *     description: Deletes a specific service by ID.
 *     operationId: deleteService
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the service
 *     responses:
 *       '204':
 *         description: Service deleted successfully
 *       '404':
 *         description: Service not found
 */
