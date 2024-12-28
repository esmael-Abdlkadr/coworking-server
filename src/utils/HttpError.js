class HttpError extends Error {
  statusCode;
  status;
  isOperational;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "failed" : "error";
    this.isOperational = true; //known or expected error
    Error.captureStackTrace(this, this.constructor);
  }
}

export default HttpError;
