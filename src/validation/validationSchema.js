import joi from "joi";

export const signupSchema = joi.object({
  firstName: joi.string().trim().required().messages({
    "string.empty": "First name is required",
  }),
  lastName: joi.string().trim().required().messages({
    "string.empty": "Last name is required",
  }),
  email: joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),

  role: joi.string().valid("user", "admin").default("user"),
});

export const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

export const optSchema = joi.object({
  otp: joi.string().length(6).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits",
  }),
  email: joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email",
  }),
});

export const planSchema = joi.object({
  title: joi.string().trim().required().messages({
    "string.empty": "Title is required",
  }),
  description: joi.string().trim().required().messages({
    "string.empty": "Description is required",
  }),
  price: joi.number().required().messages({
    "number.base": "Price must be a number",
    "any.required": "Price is required",
  }),
  duration: joi.number().required().messages({
    "number.base": "Duration must be a number",
    "any.required": "Duration is required",
  }),
  features: joi.array().items(joi.string()).default([]),
});

export const bookingSchema = joi.object({
  service: joi.string().required().messages({
    "any.required": "Service is required",
    "string.base": "Service ID must be a string",
  }),
  bookingDate: joi.date().required().messages({
    "any.required": "Booking date is required",
    "date.base": "Invalid booking date format",
  }),
  startTime: joi
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .required()
    .messages({
      "any.required": "Start time is required",
      "string.pattern.base": "Invalid start time format (HH:mm)",
    }),
  endTime: joi
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .required()
    .messages({
      "any.required": "End time is required",
      "string.pattern.base": "Invalid end time format (HH:mm)",
    }),
});

export const eventSchema = joi.object({
  title: joi.string().trim().required().messages({
    "string.empty": "Title is required",
  }),
  description: joi.string().trim().required().messages({
    "string.empty": "Description is required",
  }),
  date: joi.date().required().messages({
    "any.required": "Date is required",
    "date.base": "Invalid date format",
  }),
  time: joi.string().trim().required().messages({
    "string.empty": "Time is required",
  }),
  location: joi.string().trim().required().messages({
    "string.empty": "Location is required",
  }),
  category: joi.string().trim().required().messages({
    "string.empty": "Category is required",
  }),
  images: joi.array().items(joi.string().uri()).optional().messages({
    "string.uri": "Invalid image URL format",
  }),
});
