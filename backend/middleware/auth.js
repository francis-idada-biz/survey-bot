const jwt = require("jsonwebtoken");

// Authentication middleware
exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.user_id,       // normalize so backend uses req.user.id
      user_id: decoded.user_id,  // keep original field too
      role: decoded.role,
      email: decoded.email,
      name: decoded.name
    };

    next();

  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Authorization middleware
exports.requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: "Forbidden — insufficient role" });
    }

    next();
  };
};
