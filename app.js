const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(cors());

// Secure HTTP headers
app.use(helmet());

// Cookie Parser
app.use(cookieParser());

// Serve Static Files
app.use("/uploads", express.static("uploads"));

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
app.use(`${process.env.API_ROUTE}/posts`, postRouter);
app.all("*", (req, res, next) => {
    next(new AppError(`The endpoint ${req.originalUrl} does not exist!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
