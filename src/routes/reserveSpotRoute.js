import express from "express";
import { protect, restrictTo } from "../controller/authController.js";
import {
  reserveSpot,
  getReservations,
  getAllReservations,
  cancelReservation,
} from "../controller/reserveSpotController.js";
import { reservationRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/reserve", protect, reservationRateLimiter, reserveSpot);
router.get("/reservations", protect, getReservations);
router.get(
  "/all-reservations",
  protect,
  restrictTo("admin"),
  getAllReservations
);
router.patch("/cancel/:reservationId", protect, cancelReservation);

export default router;

// RESERVATIONS.
/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Reservation management
 */

// Reserve a spot.
/**
 * @swagger
 * /api/reserveSpot/reserve:
 *   post:
 *     summary: Reserve a spot for an event
 *     tags: [Reservations]
 *     description: Reserves a spot for a specific event.
 *     operationId: reserveSpot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event to reserve a spot for
 *     responses:
 *       '201':
 *         description: Spot reserved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       '400':
 *         description: Invalid input data or event is fully booked
 *       '404':
 *         description: Event not found
 */

// Get user reservations
/**
 * @swagger
 * /api/reserveSpot/reservations:
 *   get:
 *     summary: Get user reservations
 *     tags: [Reservations]
 *     description: Retrieves a list of reservations made by the authenticated user.
 *     operationId: getReservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       '500':
 *         description: Server error
 */

// Get all reservations (admin only)
/**
 * @swagger
 * /api/reserveSpot/all-reservations:
 *   get:
 *     summary: Get all reservations
 *     tags: [Reservations]
 *     description: Retrieves a list of all reservations (admin only).
 *     operationId: getAllReservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: "createdAt"
 *         description: Field to sort by
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Sort direction
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by event ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [reserved, cancelled, waitlisted]
 *         description: Filter by reservation status
 *     responses:
 *       '200':
 *         description: List of all reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalReservations:
 *                   type: integer
 *                   description: Total number of reservations
 *                 reservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Server error
 */

// Cancel a reservation
/**
 * @swagger
 * /api/reserveSpot/cancel/{reservationId}:
 *   patch:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     description: Cancels a specific reservation by ID.
 *     operationId: cancelReservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reservationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the reservation
 *     responses:
 *       '200':
 *         description: Reservation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Reservation not found
 */
