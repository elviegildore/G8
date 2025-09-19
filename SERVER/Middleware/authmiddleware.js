import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ Verify token
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token
  if (!token) return res.status(401).json({ success: false, error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
};

// ✅ Check admin role
export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admin access only" });
  }
  next();
};
