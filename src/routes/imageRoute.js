import express from "express";
import {
  deleteImage,
  getImage,
  getImages,
  updateImage,
  uploadIMage,
} from "../controller/ImageController.js";
import { protect } from "../middleware/authMIddleware.js";

const router = express.Router();
router.route("/").get(getImages).post(protect, uploadIMage);
router
  .route("/:id")
  .get(getImage)
  .patch(protect, updateImage)
  .delete(protect, deleteImage);

export default router;
