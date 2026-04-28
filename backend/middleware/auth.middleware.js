<<<<<<< Updated upstream
=======
import jwt from 'jsonwebtoken';
export function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated. Please log in.' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Forbidden. Required role(s): ${roles.join(', ')}`,
    });
  }
  next();
};
>>>>>>> Stashed changes
