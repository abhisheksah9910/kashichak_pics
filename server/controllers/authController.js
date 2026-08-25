const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return error(res, 400, 'Name, email and password are required.');
    }

    if (!validator.isEmail(email)) {
      return error(res, 400, 'Please enter a valid email address.');
    }

    if (password.length < 6) {
      return error(res, 400, 'Password must be at least 6 characters.');
    }

    const existing = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existing) {
      return error(res, 409, 'An account with this email already exists.');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    const token = signToken(user._id);

    return success(res, 201, 'Account created successfully.', {
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 400, 'Email and password are required.');
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return error(res, 401, 'Incorrect email or password.');
    }

    if (user.isBanned) {
      return error(res, 403, 'This account has been suspended.');
    }

    const token = signToken(user._id);

    return success(res, 200, 'Logged in successfully.', {
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return success(res, 200, 'Current user fetched.', {
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };