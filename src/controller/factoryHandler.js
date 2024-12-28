import asyncHandler from "../utils/asycnHandler.js";
import HttpError from "../utils/HttpError.js";
const create = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc.toJSON(),
    });
  });
const getAll = (Model, populatedField = []) =>
  asyncHandler(async (_req, res) => {
    let query = Model.find();
    //conditionally add populate  to query  if the field exist
    populatedField.forEach((field) => {
      if (Model.schema.path(field)) query = query.populate(field);
    });

    const docs = await query;
    res.status(200).json({
      status: "success",
      data: docs.map((doc) => doc.toJSON()),
    });
  });
const getOne = (Model, populatedField = []) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    populatedField.forEach((field) => {
      if (Model.schema.path(field)) query = query.populate(field);
    });
    const doc = await query;
    if (!doc) {
      return next(new HttpError("Resource not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: doc.toJSON(),
    });
  });
const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new HttpError("Resource not found", 404));
    }
    res.status(200).json({
      status: "success",
      data: doc.toJSON(),
    });
  });
const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new HttpError("Resource not found", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
export { create, getAll, getOne, updateOne, deleteOne };
