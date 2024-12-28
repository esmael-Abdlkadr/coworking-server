import ReserveSpot from "../models/reserveSpot.js";
import Event from "../models/events.js";
import asyncHandler from "../utils/asycnHandler.js";
import HttpError from "../utils/HttpError.js";
import mongoose from "mongoose";
import sendEmail from "../utils/email.js";
import { getPagination } from "../utils/pagination.js";
import { getSortQuery } from "../utils/sortUtil.js";

const reserveSpot = asyncHandler(async (req, res, next) => {
  const { eventId, waitlist } = req.body;
  const userId = req.user._id;
  console.log(
    `Event ID: ${eventId}, User ID: ${userId}, Waitlist: ${waitlist}`
  );

  // Start a session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the event within the session
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      throw new HttpError("Event not found", 404);
    }

    // Count the number of reserved spots within the session
    const reservationCount = await ReserveSpot.countDocuments({
      event: eventId,
      status: "reserved",
    }).session(session);

    // Check if the event is full
    if (reservationCount >= event.capacity) {
      if (waitlist) {
        const existingWailist = await ReserveSpot.findOne({
          event: eventId,
          user: userId,
          status: "waitlisted",
        }).session(session);
        if (existingWailist) {
          next(
            new HttpError("You are already on the waitlist for this event", 400)
          );
        }
        // Add user to waitlist if the event is full and waitlist is true
        const waitListEntry = await ReserveSpot.create(
          [{ event: eventId, user: userId, status: "waitlisted" }],
          { session }
        );
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json({
          status: "success",
          message:
            "You have been added to the waitlist. We will notify you via email once a spot becomes available",
          waitListEntry,
        });
      } else {
        throw new HttpError("Event is fully booked", 400);
      }
    }

    // Check if the user has already reserved a spot
    const existingReservation = await ReserveSpot.findOne({
      event: eventId,
      user: userId,
    }).session(session);

    if (existingReservation && existingReservation.status === "reserved") {
      throw new HttpError(
        "You have already reserved a spot for this event",
        400
      );
    }

    // Allow re-reservation if the previous reservation was canceled
    if (existingReservation && existingReservation.status === "cancelled") {
      existingReservation.status = "reserved";
      await existingReservation.save({ session });
      await session.commitTransaction();
      session.endSession();
      return res.status(201).json({
        status: "success",
        message: "Spot reserved successfully",
        reservation: existingReservation,
      });
    }

    // Reserve a spot for the user
    const reservation = await ReserveSpot.create(
      [{ event: eventId, user: userId, status: "reserved" }],
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      status: "success",
      message: "Spot reserved successfully",
      reservation,
    });
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

const getReservations = asyncHandler(async (req, res) => {
  const reservations = await ReserveSpot.find({ user: req.user._id }).populate(
    "event"
  );

  res.status(200).json({
    status: "success",
    reservations,
  });
});

const getAllReservations = asyncHandler(async (req, res) => {
  const { page, limit, sortField, sortDirection, eventId, status } = req.query;
  console.log("Query: ", req.query);

  // Validate query parameters
  if (!page || !limit || !sortField || !sortDirection) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required query parameters",
    });
  }

  const query = {};
  if (eventId) query.event = eventId;
  if (status) query.status = status;

  const sortOptions = getSortQuery(sortField, sortDirection);
  const { skip, limit: pageLimit } = getPagination(page, limit);

  const reservations = await ReserveSpot.find(query)
    .populate("event user")
    .sort(sortOptions)
    .skip(skip)
    .limit(pageLimit);

  const totalReservations = await ReserveSpot.countDocuments(query);

  res.status(200).json({
    status: "success",
    totalReservations,
    reservations,
  });
});

const cancelReservation = asyncHandler(async (req, res, next) => {
  const { reservationId } = req.params;
  const reservation = await ReserveSpot.findById(reservationId);

  if (!reservation) {
    return next(new HttpError("Reservation not found", 404));
  }

  reservation.status = "cancelled";
  await reservation.save();

  // Move the first user from the waitlist to reserved status
  const waitlistUser = await ReserveSpot.findOneAndUpdate(
    { event: reservation.event, status: "waitlisted" },
    { status: "reserved" },
    { sort: { reservedAt: 1 }, new: true }
  ).populate("user event");

  if (waitlistUser) {
    // Send email to the user
    const data = {
      user: {
        name: waitlistUser.user.firstName,
        email: waitlistUser.user.email,
      },
      event: {
        title: waitlistUser.event.title,
        date: waitlistUser.event.date,
        time: waitlistUser.event.time,
      },
    };
    await sendEmail({
      email: waitlistUser.user.email,
      subject: "Spot Available for Event",
      template: "spotAvailable",
      date: data,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Reservation cancelled successfully",
    reservation,
    waitlistUser,
  });
});

export { reserveSpot, getReservations, getAllReservations, cancelReservation };
