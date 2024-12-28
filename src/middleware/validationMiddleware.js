import joi from "joi";
import HttpError from "../utils/HttpError.js";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false }); // Capture all errors
  if (error) {
    const errMessage = error.details.map((err) => err.message).join(",");
    return next(new HttpError(errMessage, 400));
  }
  next();
};
export default validate;
