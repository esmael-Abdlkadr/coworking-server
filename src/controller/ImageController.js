import Image from "../models/images.js";
import asyncHandler from "../utils/asycnHandler.js";
import cloudinary from "../config/cloudinary.js";
const uploadIMage = asyncHandler(async (req, res, next) => {
  const { name, altText, imageUrl } = req.body;
  const image = new Image({
    name,
    altText,
    imageUrl,
  });
  await image.save();
  res.status(201).json({
    success: true,
    data: image,
  });
});
const getImages = asyncHandler(async (req, res, next) => {
  const images = await Image.find();
  res.status(200).json({
    success: true,
    data: images,
  });
});
const getImage = asyncHandler(async (req, res, next) => {
  const image = await Image.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error("Image not found");
  }
  res.status(200).json({
    success: true,
    data: image,
  });
});

const updateImage = asyncHandler(async (req, res, next) => {
  const image = await Image.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error("Image not found");
  }
  const { name, altText } = req.body;
  image.name = name;
  image.altText = altText;
  await image.save();
  res.status(200).json({
    success: true,
    data: image,
  });
});
const deleteImage = asyncHandler(async (req, res, next) => {
  const image = await Image.findById(req.params.id);
  console.log("image", image);
  if (!image) {
    res.status(404);
    throw new Error("Image not found");
  }

  if (image.imageUrl) {
    // Remove from Cloudinary
    const publicId = image.imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`uploads/${publicId}`);
  }
  //   remove from database
  await Image.findByIdAndDelete(req.params.id);
  res.status(204).json({
    success: true,
    data: null,
  });
});

export { uploadIMage, getImages, getImage, deleteImage, updateImage };
