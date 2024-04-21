// const jwt = require('jsonwebtoken');

// // Middleware function to authenticate JWT token
// const authMiddleware = (req, res, next) => {
//   // Get token from request headers
//   const authHeader = req.headers.authorization;

//   // Check if token doesn't exist
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'No token, authorization denied' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     // Verify token
//     const payload = jwt.verify(token, 'secret_key');
//     req.user = { userId: payload.userId };
//     next();
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');

// Middleware function to authenticate JWT token and authorize access based on user role
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
    req.user = { userId: payload.userId, role: payload.role };
    // console.log('Authenticated user:', req.user);

    // Check if user is a super admin
    if (req.user.role === 'superadmin') {
      req.isSuperAdmin = true; // Add a flag to indicate super admin
    } else if (req.user.role === 'admin') {
      req.isSuperAdmin = false; // Add a flag to indicate non-super admin
    } else if (req.user.role === 'user') {
      req.isSuperAdmin = false; // Add a flag to indicate non-super admin
    } else {
      return res.status(403).json({ message: 'Unauthorized: Super admin or authenticated user access required' });
    }

    next(); // Move to the next middleware
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
