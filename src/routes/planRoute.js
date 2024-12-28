import express from "express";
import { protect, restrictTo } from "../controller/authController.js";
import validate from "../middleware/validationMiddleware.js";
import { planSchema } from "../validation/validationSchema.js";
import {
  createPlan,
  getAllPlans,
  getPlan,
  updatePlan,
  deletePlan,
} from "../controller/planController.js";

const router = express.Router();

router
  .route("/")
  .get(getAllPlans)
  .post(protect, restrictTo("admin"), validate(planSchema), createPlan);

router
  .route("/:id")
  .get(getPlan)
  .patch(protect, restrictTo("admin"), updatePlan)
  .delete(protect, restrictTo("admin"), deletePlan);

export default router;
/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Plan management
 */

/**
 * @swagger
 * /api/plan:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
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
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               duration:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - title
 *               - price
 *               - description
 *               - duration
 *               - features
 *     responses:
 *       201:
 *         description: plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *                     duration:
 *                       type: number
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /api/plan:
 *   get:
 *     summary: Get all plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: Successfully retrieved all plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       price:
 *                         type: number
 *                       description:
 *                         type: string
 *                       duration:
 *                         type: number
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 */

/**
 * @swagger
 * /api/plan/{id}:
 *   get:
 *     summary: Get a single plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the plan to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *                     duration:
 *                       type: number
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: plan not found
 */

/**
 * @swagger
 * /api/plan/{id}:
 *   patch:
 *     summary: Update a plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the plan to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               duration:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *                     duration:
 *                       type: number
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: plan not found
 */
