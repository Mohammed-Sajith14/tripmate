import User from '../models/User.model.js';
import { generateToken } from '../middleware/auth.middleware.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client();

const sanitizeUserId = (value = '') => {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');

  if (!sanitized) {
    return 'traveler';
  }

  if (sanitized.length >= 3) {
    return sanitized.slice(0, 30);
  }

  return `${sanitized}${'0'.repeat(3 - sanitized.length)}`;
};

const generateUniqueUserId = async (email, preferredUserId = '') => {
  const baseFromEmail = email?.split('@')?.[0] || 'traveler';
  const baseUserId = sanitizeUserId(preferredUserId || baseFromEmail);

  let candidate = baseUserId;
  let counter = 0;

  while (await User.findOne({ userId: candidate })) {
    counter += 1;
    const suffix = `_${counter}`;
    const maxBaseLength = Math.max(1, 30 - suffix.length);
    candidate = `${baseUserId.slice(0, maxBaseLength)}${suffix}`;
  }

  return candidate;
};

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

// @desc    Login/Signup with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { idToken, mode = 'login', role, organizationName, userId } = req.body;

    if (!idToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Google ID token is required'
      });
    }

    if (!['login', 'signup'].includes(mode)) {
      return res.status(400).json({
        status: 'error',
        message: 'Mode must be either login or signup'
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        status: 'error',
        message: 'Google authentication is not configured on the server'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      return res.status(401).json({
        status: 'error',
        message: 'Unable to verify Google account'
      });
    }

    if (payload.email_verified === false) {
      return res.status(401).json({
        status: 'error',
        message: 'Google email is not verified'
      });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const fullName = payload.name?.trim() || email.split('@')[0];
    const profilePicture = payload.picture || '';

    let user = await User.findOne({
      $or: [
        { googleId },
        { email }
      ]
    }).select('+password');

    if (mode === 'signup') {
      const normalizedRole = role?.toLowerCase();

      if (user) {
        if (!user.isActive) {
          return res.status(401).json({
            status: 'error',
            message: 'Your account has been deactivated'
          });
        }

        if (!user.googleId) {
          user.googleId = googleId;
        }

        if (!user.profilePicture && profilePicture) {
          user.profilePicture = profilePicture;
        }

        user.lastLogin = Date.now();
        await user.save();

        const token = generateToken(user._id);

        return res.status(200).json({
          status: 'success',
          message: 'Account already exists. Logged in successfully',
          data: {
            token,
            user: user.getPublicProfile()
          }
        });
      }

      if (!normalizedRole || !['traveler', 'organizer'].includes(normalizedRole)) {
        return res.status(400).json({
          status: 'error',
          message: 'Role is required to create a new account'
        });
      }

      if (normalizedRole === 'organizer' && !organizationName?.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Organization name is required for organizers'
        });
      }

      const uniqueUserId = await generateUniqueUserId(email, userId);

      user = await User.create({
        userId: uniqueUserId,
        email,
        fullName,
        role: normalizedRole,
        organizationName: normalizedRole === 'organizer' ? organizationName.trim() : undefined,
        authProvider: 'google',
        googleId,
        profilePicture,
        lastLogin: Date.now()
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        status: 'success',
        message: 'Google signup successful',
        data: {
          token,
          user: user.getPublicProfile()
        }
      });
    }

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No account found with this Google email. Please sign up first.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated'
      });
    }

    if (user.googleId && user.googleId !== googleId) {
      return res.status(401).json({
        status: 'error',
        message: 'This Google account is not linked to the selected profile'
      });
    }

    if (!user.googleId) {
      user.googleId = googleId;
    }

    if (!user.profilePicture && profilePicture) {
      user.profilePicture = profilePicture;
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Google login successful',
      data: {
        token,
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    const statusCode = error.message?.includes('Wrong number of segments') ? 401 : 500;

    res.status(statusCode).json({
      status: 'error',
      message: statusCode === 401 ? 'Invalid Google token' : 'Error authenticating with Google'
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
