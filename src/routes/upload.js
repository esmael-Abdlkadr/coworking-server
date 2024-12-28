import express from "express";
import multer from "multer";
import asyncHandler from "../utils/asycnHandler.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const router = express.Router();
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

router.post(
  "/",
  upload.array("images"),
  asyncHandler(async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please upload a file",
      });
    }
    const uploadPromises = files.map((file) => {
      const stream = Readable.from(file.buffer);
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "uploads",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.pipe(uploadStream);
      });
    });
    // wait for files to upload, then send response
    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      status: "success",
      message: "Image uploaded successfully",
      data: results.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      })),
    });
  })
);

export default router;
