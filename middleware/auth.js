const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
      
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ error: 'User no longer exists or is inactive' });
      }
      
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };

