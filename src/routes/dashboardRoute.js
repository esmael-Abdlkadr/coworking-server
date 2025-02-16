import express from "express";
import { getDashbaordSummary } from "../controller/DashboardSummaryController.js";
const router = express.Router();
router.get("/", getDashbaordSummary);
/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard summary
 *     description: Retrieve a summary of the dashboard
 *     parameters:
 *       - in: query
 *         name: timeFrame
 *         schema:
 *           type: integer
 *         required: true
 *         description: The number of days to look back for the summary.
 *     responses:
 *       200:
 *         description: A JSON object containing the dashboard summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalBookings:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         change:
 *                           type: number
 *                         subStats:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                               value:
 *                                 type: integer
 *                     occupancyRate:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                         change:
 *                           type: number
 *                         subStats:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                               value:
 *                                 type: integer
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                         change:
 *                           type: number
 *                         subStats:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                               value:
 *                                 type: number
 *                     upcomingEvents:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         change:
 *                           type: number
 *                         subStats:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                               value:
 *                                 type: integer
 *                     blogEngagement:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         change:
 *                           type: number
 *                         subStats:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                               value:
 *                                 type: integer
 *                 charts:
 *                   type: object
 *                   properties:
 *                     spaceUtilization:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           bookings:
 *                             type: integer
 *                           occupancyRate:
 *                             type: number
 *                     eventAttendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           registrations:
 *                             type: integer
 *                           attendance:
 *                             type: integer
 *                     revenueBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                           value:
 *                             type: number
 *                     blogActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           views:
 *                             type: integer
 *                           comments:
 *                             type: integer
 *                           shares:
 *                             type: integer
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */

export default router;
