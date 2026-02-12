import User from '../models/User.model.js';

// Search users by userId or fullName
export const searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const skip = (page - 1) * limit;

    // Search by userId or fullName, exclude current user
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { userId: searchRegex },
        { fullName: searchRegex },
      ],
    })
      .select('userId fullName profilePicture role organizationName bio')
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await User.countDocuments({
      _id: { $ne: currentUserId },
      $or: [
        { userId: searchRegex },
        { fullName: searchRegex },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasMore: skip + users.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message,
    });
  }
};

// Get user profile by userId
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId: userId.toLowerCase() })
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
};
