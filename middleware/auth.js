const jwt = require('jsonwebtoken');

// Middleware function to authenticate JWT token
const authMiddleware = (req, res, next) => {
  // Get token from request headers
  const authHeader = req.headers.authorization;

  // Check if token doesn't exist
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const payload = jwt.verify(token, 'secret_key');
    req.user = { userId: payload.userId };
    next();
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
