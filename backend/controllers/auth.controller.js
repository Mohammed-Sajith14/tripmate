import User from '../models/User.model.js';
import { generateToken } from '../middleware/auth.middleware.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { userId, email, password, fullName, role, organizationName } = req.body;

    // Validation
    if (!userId || !email || !password || !fullName || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    if (role === 'organizer' && !organizationName) {
      return res.status(400).json({
        status: 'error',
        message: 'Organization name is required for organizers'
      });
    }

    // Check if user already exists
    const userIdExists = await User.findOne({ userId: userId.toLowerCase() });
    if (userIdExists) {
      return res.status(400).json({
        status: 'error',
        message: 'This User ID is already taken'
      });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        status: 'error',
        message: 'This email is already registered'
      });
    }

    // Create user
    const userData = {
      userId: userId.toLowerCase(),
      email: email.toLowerCase(),
      password,
      fullName,
      role
    };

    if (role === 'organizer') {
      userData.organizationName = organizationName;
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error registering user'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validation
    if (!userId || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide userId and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ userId: userId.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated'
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error logging in'
    });
  }
};

// @desc    Check if userId is available
// @route   GET /api/auth/check-userid/:userId
// @access  Public
export const checkUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const userExists = await User.findOne({ userId: userId.toLowerCase() });

    res.status(200).json({
      status: 'success',
      data: {
        available: !userExists,
        userId: userId.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Check userId error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking userId availability'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user is set by protect middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error getting user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'fullName',
      'bio',
      'location',
      'profilePicture',
      'organizationName',
      'organizationLocation',
      'organizationDescription'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error changing password'
    });
  }
};
