import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

const signToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  sendSuccess(
    res,
    { user: formatUser(user), token },
    'Registration successful',
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id);
  sendSuccess(res, { user: formatUser(user), token }, 'Login successful');
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: formatUser(req.user) });
});
