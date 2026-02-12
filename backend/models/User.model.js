import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic User Info
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9_]+$/, 'User ID can only contain lowercase letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  
  // User Role
  role: {
    type: String,
    enum: ['traveler', 'organizer'],
    required: [true, 'User role is required']
  },

  // Profile Information
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },

  // Organizer-Specific Fields
  organizationName: {
    type: String,
    required: function() {
      return this.role === 'organizer';
    }
  },
  organizationLocation: {
    type: String,
    default: ''
  },
  organizationDescription: {
    type: String,
    maxlength: [1000, 'Organization description cannot exceed 1000 characters'],
    default: ''
  },
  verified: {
    type: Boolean,
    default: false // For organizer verification
  },

  // Statistics (auto-calculated)
  stats: {
    tripsCreated: { type: Number, default: 0 }, // For organizers
    tripsJoined: { type: Number, default: 0 }, // For travelers
    countriesVisited: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 }
  },

  // Social Stats
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
