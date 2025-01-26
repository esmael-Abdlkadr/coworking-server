import express from "express";
import { restrictTo } from "../controller/authController.js";
import {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../controller/eventController.js";
import { protect } from "../middleware/authMIddleware.js";
const router = express.Router();
router.post("/", protect, restrictTo("admin", "superAdmin"), createEvent);
router.get("/", getAllEvents);
router
  .route("/:id")
  .get(getEvent)
  .patch(protect, restrictTo("admin", "superAdmin"), updateEvent)
  .post(protect, restrictTo("admin", "superAdmin"), deleteEvent);

export default router;

// EVENTS.
/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */

// Create an event.
/**
 * @swagger
 * /api/Event:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     description: Creates a new event entry in the database.
 *     operationId: createEvent
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
 *                 description: Title of the event
 *               description:
 *                 type: string
 *                 description: Description of the event
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the event
 *               time:
 *                 type: string
 *                 description: Time of the event
 *               location:
 *                 type: string
 *                 description: Location of the event
 *               image:
 *                 type: string
 *                 description: Image of the event
 *               link:
 *                 type: string
 *                 description: Link for the event
 *     responses:
 *       '201':
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       '400':
 *         description: Invalid input data
 */

// Get all events
/**
 * @swagger
 * /api/Event:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     description: Retrieves a list of all available events.
 *     operationId: getAllEvents
 *     responses:
 *       '200':
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       '500':
 *         description: Server error
 */

// Get an event by ID
/**
 * @swagger
 * /api/Event/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     description: Retrieves details of a specific event by ID.
 *     operationId: getEvent
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the event
 *     responses:
 *       '200':
 *         description: Event details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       '404':
 *         description: Event not found
 */

// Update an event by ID
/**
 * @swagger
 * /api/Event/{id}:
 *   patch:
 *     summary: Update an event by ID
 *     tags: [Events]
 *     description: Updates details of a specific event by ID.
 *     operationId: updateEvent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the event
 *               description:
 *                 type: string
 *                 description: Description of the event
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the event
 *               time:
 *                 type: string
 *                 description: Time of the event
 *               location:
 *                 type: string
 *                 description: Location of the event
 *               image:
 *                 type: string
 *                 description: Image of the event
 *               link:
 *                 type: string
 *                 description: Link for the event
 *     responses:
 *       '200':
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: Event not found
 */

// Delete an event by ID
/**
 * @swagger
 * /api/Event/{id}:
 *   delete:
 *     summary: Delete an event by ID
 *     tags: [Events]
 *     description: Deletes a specific event by ID.
 *     operationId: deleteEvent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the event
 *     responses:
 *       '200':
 *         description: Event deleted successfully
 *       '404':
 *         description: Event not found
 */
