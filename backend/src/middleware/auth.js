import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized. Please log in.', 401);
  }

  const decoded = jwt.verify(token, config.jwt.secret);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = await User.findById(decoded.id);
    } catch {
      req.user = null;
    }
  }

  next();
});
