import asyncHandler from "../utils/asycnHandler.js";
import Booking from "../models/booking.js";
import Event from "../models/events.js";
import Blog from "../models/blogs.js";
import moment from "moment";
const getDashbaordSummary = asyncHandler(async (req, res, next) => {
  const { timeFrame } = req.query;
  //   calculate date range based on time frame.
  const startDate = moment().subtract(timeFrame, "days").startOf("day");
  const endDate = moment().endOf("day");
  const totalBooking = await Booking.countDocuments({
    createdAt: { $gte: startDate, $lt: endDate },
  });
  console.log("startdATE", startDate);
  console.log("enddATE", endDate);
  console.log("totalBooking", totalBooking);
  //   occupacy rate
  // TODO :add new field on services   to store total sapce of each service and fetch it here
  const totalSpace = 100;
  const bookedSpace = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lt: endDate },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$price" },
      },
    },
  ]);
  const occupancyRate = Math.round((bookedSpace / totalSpace) * 100);
  // Fetch revenue
  const revenueFromSpaces = await Booking.aggregate([
    {
      $match: {
        bookingDate: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" },
      },
    },
    { $group: { _id: null, total: { $sum: "$price" } } },
  ]);
  const revenueFromEvents = await Event.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: null, total: { $sum: "$price" } } },
  ]);
  // upcomming events
  const upcomingEvents = await Event.countDocuments({
    date: { $gte: moment().startOf("day").toDate() },
  });
  // blog engagments.
  const blogEngagement = await Blog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
        totalComments: { $sum: { $size: "$comments" } },
      },
    },
  ]);
  // RESPONSES.
  const response = {
    stats: {
      totalBookings: {
        value: totalBooking,
        change: 5.2, // Placeholder for change calculation
        subStats: [
          { label: "Today", value: 12 }, // Placeholder
          { label: "This Week", value: 84 }, // Placeholder
        ],
      },
      occupancyRate: {
        value: occupancyRate,
        change: -2.4, // Placeholder
        subStats: [
          { label: "Available Spaces", value: totalSpace - bookedSpace },
          { label: "Booked Spaces", value: bookedSpace },
        ],
      },
      revenue: {
        value:
          (revenueFromSpaces[0]?.total || 0) +
          (revenueFromEvents[0]?.total || 0),
        change: 14.5, // Placeholder
        subStats: [
          { label: "From Spaces", value: revenueFromSpaces[0]?.total || 0 },
          { label: "From Events", value: revenueFromEvents[0]?.total || 0 },
        ],
      },
      upcomingEvents: {
        value: upcomingEvents,
        change: 3, // Placeholder
        subStats: [
          { label: "Registrations", value: 120 }, // Placeholder
          { label: "Attendees", value: 95 }, // Placeholder
        ],
      },
      blogEngagement: {
        value: blogEngagement[0]?.totalViews || 0,
        change: 12, // Placeholder
        subStats: [
          { label: "Posts", value: 15 }, // Placeholder
          { label: "Comments", value: blogEngagement[0]?.totalComments || 0 },
        ],
      },
    },
    charts: {
      spaceUtilization: [
        { name: "Jan", bookings: 45, occupancyRate: 76 }, // Placeholder
      ],
      eventAttendance: [
        { name: "Jan", registrations: 120, attendance: 95 }, // Placeholder
      ],
      revenueBreakdown: [
        { label: "Space Revenue", value: revenueFromSpaces[0]?.total || 0 },
        { label: "Event Revenue", value: revenueFromEvents[0]?.total || 0 },
      ],
      blogActivity: [
        { name: "Jan", views: 1245, comments: 45, shares: 120 }, // Placeholder
      ],
    },
  };

  res.status(200).json(response);
});
export { getDashbaordSummary };
