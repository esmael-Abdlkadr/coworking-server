import moment from "moment";
import Booking from "../models/booking.js";
import asyncHandler from "../utils/asycnHandler.js";
import HttpError from "../utils/HttpError.js";
import Service from "../models/services.js";
import { bookingSchema } from "../validation/validationSchema.js";
import { calculatePrice } from "../utils/calculatePrice.js";
import { getPagination } from "../utils/pagination.js";
import { getSortQuery } from "../utils/sortUtil.js";
const createBooking = asyncHandler(async (req, res, next) => {
  // Validate schema.
  const validationResult = bookingSchema.validate(req.body);
  if (validationResult.error) {
    return next(new HttpError(validationResult.error.message, 400));
  }

  const { service, bookingDate, startTime, endTime } = validationResult.value;
  const user = req.user;

  // Normalize bookingDate
  const normalizedBookingDate = moment(bookingDate).format("YYYY-MM-DD");

  // Prevent past booking
  const currentDate = moment().startOf("day");
  if (moment(normalizedBookingDate).isBefore(currentDate)) {
    return next(new HttpError("Booking date can't be in the past", 400));
  }

  // Parse and validate times
  const startMoment = moment(
    `${normalizedBookingDate}T${startTime}`,
    "YYYY-MM-DDTHH:mm"
  );
  const endMoment = moment(
    `${normalizedBookingDate}T${endTime}`,
    "YYYY-MM-DDTHH:mm"
  );

  if (!startMoment.isValid() || !endMoment.isValid()) {
    return next(new HttpError("Invalid start or end time", 400));
  }

  if (endMoment.isBefore(startMoment)) {
    return next(new HttpError("End time can't be before start time", 400));
  }

  const duration = endMoment.diff(startMoment, "hours", true);
  if (duration < 1) {
    return next(new HttpError("Booking duration must be at least 1 hour", 400));
  }

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    service,
    bookingDate: normalizedBookingDate,
    status: { $ne: "cancelled" }, // Ignore canceled bookings
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      { startTime: { $gte: startTime, $lte: endTime } },
    ],
  });
  if (overlappingBooking) {
    return next(new HttpError("This time slot is already booked", 400));
  }

  // Fetch service and calculate price
  const selectedService = await Service.findById(service);
  if (!selectedService) {
    return next(new HttpError("Service not found", 404));
  }
  const price = calculatePrice(selectedService.prichourlyRate, duration);

  const booking = await Booking.create({
    user: user._id,
    service,
    bookingDate: normalizedBookingDate,
    startTime,
    endTime,
    duration,
    price,
  });

  const populatedBooking = await booking.populate([
    { path: "user", select: "firstName lastName email" },
    { path: "service", select: "title prichourlyRate" },
  ]);
  // .populate("user", "firstName lastName email");

  res.status(201).json({
    status: "success",
    message: "Booking created successfully",
    booking: populatedBooking,
  });
});

const getAllBookings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    userId,
    sortField = "createdAt",
    sortDirection = "asc",
  } = req.query;
  const { skip } = getPagination(Number(page), Number(limit)).skip;
  let query = {};
  // query  filter.----check user role and filter accordingly.
  if (req.user.role !== "admin") {
    query.user = req.user.id;
  }

  if (status) {
    query.status = status;
  }
  if (userId) {
    query.user = userId;
  }
  // sort query.
  let sortQuery = {};
  try {
    sortQuery = getSortQuery(sortField, sortDirection);
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
  const bookings = await Booking.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(Number(limit))
    .populate([
      { path: "user", select: "firstName lastName email" },
      { path: "service", select: "title prichourlyRate" },
    ]);
  const totalCount = await Booking.countDocuments(query);
  res.status(200).json({
    status: "success",
    totalCount,
    bookings,
    page: Number(page),
    pages: Math.ceil(totalCount / Number(limit)),
  });
});
const getBooking = asyncHandler(async (req, res, next) => {
  const bookingId = req.params.id;
  const booking = await Booking.findById(bookingId).populate([
    { path: "user", select: "firstName lastName email" },
    { path: "service" },
  ]);
  if (!booking) {
    return next(new HttpError("Booking not found", 404));
  }
  res.status(200).json({
    status: "success",
    booking,
  });
});

const updateBooking = asyncHandler(async (req, res, next) => {
  const { bookingDate, startTime, endTime } = req.body;
  const bookingId = req.params.id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new HttpError("Booking not found", 404));
  }

  // Prevent modification of past bookings
  const currentDate = moment().startOf("day");
  if (moment(booking.bookingDate).isBefore(currentDate)) {
    return next(new HttpError("Past booking can't be modified", 400));
  }

  // Determine bookingDate to use (either provided or existing)
  let formattedBookingDate = booking.bookingDate;
  const formattedBookingDateString =
    moment(formattedBookingDate).format("YYYY-MM-DD");
  if (bookingDate) {
    formattedBookingDate = moment(bookingDate, [
      "YYYY-MM-DD",
      "MM-DD-YYYY",
    ]).format("YYYY-MM-DD");

    if (!moment(formattedBookingDate, "YYYY-MM-DD", true).isValid()) {
      return next(
        new HttpError("Invalid date format. Please use 'YYYY-MM-DD'.", 400)
      );
    }
  }
  const updatedStartTime = startTime || booking.startTime;
  const updatedEndTime = endTime || booking.endTime;
  // Combine bookingDate with startTime and endTime
  const combinedStartTime = moment(
    `${formattedBookingDateString} ${updatedStartTime}`,
    "YYYY-MM-DD hh:mm A" //  'hh:mm A' for 12-hour format with AM/PM
  );
  const combinedEndTime = moment(
    `${formattedBookingDateString} ${updatedEndTime}`,
    "YYYY-MM-DD hh:mm A"
  );

  // Validate combined start and end times
  if (!combinedStartTime.isValid() || !combinedEndTime.isValid()) {
    return next(new HttpError("Invalid start or end time.", 400));
  }

  // Check if end time is greater than start time
  if (combinedEndTime.isBefore(combinedStartTime)) {
    return next(new HttpError("End time can't be before start time", 400));
  }

  // Ensure booking duration is at least 1 hour
  const duration = combinedEndTime.diff(combinedStartTime, "hours", true);
  if (duration < 1) {
    return next(new HttpError("Booking duration must be at least 1 hour", 400));
  }

  // Fetch the service and calculate the price
  const selectedService = await Service.findById(booking.service);
  if (!selectedService) {
    return next(new HttpError("Service not found", 404));
  }

  // Check for overlapping bookings
  const overlappingBooking = await Booking.findOne({
    service: booking.service,
    bookingDate: formattedBookingDate,
    _id: { $ne: bookingId }, // Exclude the current booking
    $or: [
      {
        startTime: { $lt: updatedEndTime },
        endTime: { $gt: updatedStartTime },
      },
      { startTime: { $gte: updatedStartTime, $lte: updatedEndTime } },
    ],
  });

  if (overlappingBooking) {
    return next(new HttpError("This time slot is already booked", 400));
  }

  // Calculate the price
  const price = calculatePrice(selectedService.hourlyRate, duration);

  // Update the booking
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      bookingDate: formattedBookingDate,
      startTime: updatedStartTime,
      endTime: updatedEndTime,
      duration,
      price,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Booking updated successfully",
    updatedBooking,
  });
});

const cancelBooking = asyncHandler(async (req, res, next) => {
  const bookingId = req.params.id;
  const user = req.user;

  const booking = await Booking.findById({ _id: bookingId, user: user._id });
  if (!booking) {
    return next(new HttpError("Booking not found", 404));
  }
  // prevent cancellation of completed or already cancelled bookings.
  if (booking.status === "cancelled" || booking.status === "completed") {
    return next(new HttpError("Booking has already been cancelled", 400));
  }
  // prevent cancellation of past bookings.
  const currentDate = moment().startOf("day");
  if (moment(booking.bookingDate).isBefore(currentDate)) {
    return next(new HttpError("Past booking can't be cancelled", 400));
  }
  // update statusof booking to cancelled.
  booking.status = "cancelled";
  await booking.save();
  res.status(200).json({
    status: "success",
    message: "Booking cancelled successfully",
    booking,
  });
});
export {
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  cancelBooking,
};
