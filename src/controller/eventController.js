import { getOne } from "./factoryHandler.js";
import Event from "../models/events.js";
import asyncHandler from "../utils/asycnHandler.js";
import HttpError from "../utils/HttpError.js";
import moment from "moment";
import { eventSchema } from "../validation/validationSchema.js";
import { getPagination } from "../utils/pagination.js";
import { getSortQuery } from "../utils/sortUtil.js";

const createEvent = asyncHandler(async (req, res, next) => {
  const validationResult = eventSchema.validate(req.body);
  if (validationResult.error) {
    return next(new HttpError(validationResult.error.message, 400));
  }

  const { title, description, date, time, location, category, images } =
    validationResult.value;

  // Normalize date
  const normalizedDate = moment(date).format("YYYY-MM-DD");

  // Parse and validate time
  const eventTime = moment(time, "hh:mm A");
  if (!eventTime.isValid()) {
    return next(new HttpError("Invalid time format (hh:mm A)", 400));
  }
  const event = await Event.create({
    title,
    description,
    date: normalizedDate,
    time: eventTime.format("hh:mm A"),
    location,
    category,
    images,
    capacity: req.body.capacity || 100, // Default capacity if not provided
  });
  res.status(201).json({
    status: "success",
    message: "Event created successfully",
    event,
  });
});

const getAllEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortField = "createdAt",
    sortDirection = "asc",
  } = req.query;
  const { skip } = getPagination(Number(page), Number(limit)).skip;
  let query = { deleted: { $ne: true } }; // Exclude deleted events

  // sort query.
  let sortQuery = {};
  try {
    sortQuery = getSortQuery(sortField, sortDirection);
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
  const events = await Event.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(Number(limit));
  const totalCount = await Event.countDocuments(query);
  res.status(200).json({
    status: "success",
    totalCount,
    events,
    page: Number(page),
    pages: Math.ceil(totalCount / Number(limit)),
  });
});

const getEvent = getOne(Event);

const updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next(new HttpError("Event not found", 404));
  }

  if (event.deleted) {
    return next(new HttpError("Cannot update a deleted event", 400));
  }

  const updateData = req.body;

  const {
    title,
    description,
    date,
    time,
    location,
    category,
    images,
    capacity,
  } = updateData;

  // Normalize date
  const normalizedDate = date ? moment(date).format("YYYY-MM-DD") : event.date;

  // Parse and validate time
  const eventTime = time
    ? moment(time, "hh:mm A")
    : moment(event.time, "hh:mm A");
  if (time && !eventTime.isValid()) {
    return next(new HttpError("Invalid time format (hh:mm A)", 400));
  }

  event.title = title || event.title;
  event.description = description || event.description;
  event.date = normalizedDate;
  event.time = eventTime.format("hh:mm A");
  event.location = location || event.location;
  event.category = category || event.category;
  event.images = images || event.images;
  event.capacity = capacity || event.capacity;

  await event.save();

  res.status(200).json({
    status: "success",
    message: "Event updated successfully",
    event,
  });
});

const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next(new HttpError("Event not found", 404));
  }

  event.deleted = true;
  await event.save();

  res.status(200).json({
    status: "success",
    message: "Event deleted successfully",
  });
});

export { createEvent, updateEvent, deleteEvent, getAllEvents, getEvent };
