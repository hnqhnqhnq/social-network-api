const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Secure HTTP headers
app.use(helmet());

// Cookie Parser
app.use(cookieParser());

// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use(process.env.API_ROUTE, limiter);

// Body parser
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// hpp*

// Routes
app.use(`${process.env.API_ROUTE}/users`, userRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`The endpoint ${req.originalUrl} does not exist!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;