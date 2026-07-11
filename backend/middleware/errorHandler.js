const handleCastError = (err) => ({
  status: 400,
  message: `Invalid ID format: ${err.value}`,
});

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return { status: 409, message: `"${value}" already exists for field: ${field}` };
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return { status: 400, message: messages.join(", ") };
};

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  let status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") ({ status, message } = handleCastError(err));
  else if (err.code === 11000) ({ status, message } = handleDuplicateKey(err));
  else if (err.name === "ValidationError") ({ status, message } = handleValidationError(err));

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;