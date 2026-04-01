const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const routes = require("./routes");
const { errorHandler } = require("./helpers/errorHandler");

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Session middleware - using memory store for development
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    },
  }),
);

// Make user data available in templates
app.use((req, res, next) => {
  res.locals.user = req.session?.userId
    ? {
        userId: req.session.userId,
        name: req.session.name,
        role: req.session.role,
      }
    : null;
  res.locals.isAuthenticated = !!req.session?.userId;
  next();
});

// === ROUTES ===
app.use("/", routes);

// === 404 Not Found Handler (before error handler) ===
app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.status = 404;
  next(error); // Pass to error handler
});

// === Error Handling Middleware (MUST be last) ===
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`✓ App listening on port ${port}`);
});
