import express from "express";
import { restrictTo } from "../controller/authController.js";
import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
} from "../controller/bookingController.js";
import { protect } from "../middleware/authMIddleware.js";
const router = express.Router();
router
  .route("/")
  .get(protect, restrictTo("admin"), getAllBookings)
  .post(protect, createBooking);
router.patch("/cancel/:id", protect, cancelBooking);
router.route("/:id").get(getBooking).patch(protect, updateBooking);

// ADMIN.
router.route("/admin").get(protect, restrictTo("admin"), getAllBookings);

export default router;

// Bookings
/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

// Create a booking
/**
 * @swagger
 * /api/Booking:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     description: Creates a new booking entry in the database.
 *     operationId: createBooking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: ID of the user
 *               service:
 *                 type: string
 *                 description: ID of the service
 *               bookingDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the booking
 *               bookingTime:
 *                 type: string
 *                 description: Time of the booking
 *               bookingPrice:
 *                 type: number
 *                 description: Price of the booking
 *               status:
 *                 type: string
 *                 description: Status of the booking
 *     responses:
 *       '201':
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       '400':
 *         description: Invalid input data
 */
// Get all bookings
/**
 * @swagger
 * /api/Booking:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     description: Retrieves a list of all available bookings.
 *     operationId: getAllBookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       '500':
 *         description: Server error
 */
// Get a booking by ID
/**
 * @swagger
 * /api/Booking/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     description: Retrieves details of a specific booking by ID.
 *     operationId: getBooking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the booking
 *     responses:
 *       '200':
 *         description: Booking details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       '404':
 *         description: Booking not found
 */
// Update a booking by ID
/**
 * @swagger
 * /api/Booking/{id}:
 *   patch:
 *     summary: Update a booking by ID
 *     tags: [Bookings]
 *     description: Updates details of a specific booking by ID.
 *     operationId: updateBooking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 description: Start time of the booking
 *                 example: "07:00"
 *               endTime:
 *                 type: string
 *                 description: End time of the booking
 *                 example: "12:00"
 *     responses:
 *       '200':
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: Booking not found
 */
// Delete a booking by ID
/**
 * @swagger
 * /api/Booking/{id}:
 *   delete:
 *     summary: Delete a booking by ID
 *     tags: [Bookings]
 *     description: Deletes a specific booking from the database by ID.
 *     operationId: deleteBooking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the booking
 *     responses:
 *       '200':
 *         description: Booking deleted successfully
 *       '404':
 *         description: Booking not found
 */
