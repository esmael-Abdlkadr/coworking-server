import Service from "../models/services.js";
import asyncHandler from "../utils/asycnHandler.js";
import { getAll, getOne, updateOne, deleteOne } from "./factoryHandler.js";

export const createService = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    amenities,
    benefits,
    location,
    images,
    prichourlyRate,
    CardDefinition,
  } = req.body;
  const user = req.user.id;
  const isTitleExist = await Service.findOne({ title });
  if (isTitleExist) {
    return res.status(400).json({
      status: "fail",
      message: "Service already exists",
    });
  }

  const service = await Service.create({
    title,
    description,
    CardDefinition,
    amenities,
    benefits,
    location,
    images,
    prichourlyRate,
    user,
  });
  res.status(201).json({
    status: "success",
    service,
  });
});
export const getAllServices = getAll(Service, ["user"]);
export const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug }).populate(
    "user"
  );
  if (!service) {
    return res.status(404).json({
      status: "fail",
      message: "Service not found",
    });
  }
  res.status(200).json({
    status: "success",
    service,
  });
});
export const updateService = updateOne(Service);
export const deleteService = deleteOne(Service);
