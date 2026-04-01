// Middleware to check if user is authenticated
const authMiddleware = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/login/add");
  }
  next();
};

// Middleware to check if user is NOT authenticated
const guestMiddleware = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }
  next();
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (!req.session || !req.session.userId || req.session.role !== "admin") {
    return res.status(403).send("Forbidden: Admin access only");
  }
  next();
};

module.exports = {
  authMiddleware,
  guestMiddleware,
  adminMiddleware,
};
