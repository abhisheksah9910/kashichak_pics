const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');
const { sendPasswordResetEmail } = require('../services/emailService');

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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return error(res, 400, 'Please provide an email address.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return error(res, 404, 'There is no user with that email address.');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    // Update user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      return success(res, 200, 'Password reset link sent to email.');
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return error(res, 500, 'There was an error sending the email. Try again later.');
    }
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return error(res, 400, 'Password must be at least 6 characters.');
    }

    // Hash token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return error(res, 400, 'Token is invalid or has expired.');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log the user in
    const jwtToken = signToken(user._id);

    return success(res, 200, 'Password updated successfully.', {
      token: jwtToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };