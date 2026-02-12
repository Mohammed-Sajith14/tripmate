import Follow from '../models/Follow.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params; // userId to follow
    const currentUserId = req.user._id;

    // Find the user to follow
    const userToFollow = await User.findOne({ userId: userId.toLowerCase() });

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Can't follow yourself
    if (userToFollow._id.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: userToFollow._id,
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user',
      });
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: currentUserId,
      following: userToFollow._id,
    });

    // Update follower and following counts
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { followingCount: 1 },
    });

    await User.findByIdAndUpdate(userToFollow._id, {
      $inc: { followersCount: 1 },
    });

    // Create notification for the followed user
    await Notification.create({
      recipient: userToFollow._id,
      sender: currentUserId,
      type: 'follow',
      message: `${req.user.fullName || req.user.userId} started following you`,
      relatedId: follow._id,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully followed user',
      data: follow,
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message,
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const userToUnfollow = await User.findOne({ userId: userId.toLowerCase() });

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find and delete the follow relationship
    const follow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: userToUnfollow._id,
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user',
      });
    }

    // Update follower and following counts
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { followingCount: -1 },
    });

    await User.findByIdAndUpdate(userToUnfollow._id, {
      $inc: { followersCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unfollowing user',
      error: error.message,
    });
  }
};

// Get followers list
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ userId: userId.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: user._id })
      .populate('follower', 'userId fullName profilePicture role bio')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Follow.countDocuments({ following: user._id });

    res.status(200).json({
      success: true,
      data: {
        followers: followers.map((f) => f.follower),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFollowers: total,
          hasMore: skip + followers.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching followers',
      error: error.message,
    });
  }
};

// Get following list
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ userId: userId.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: user._id })
      .populate('following', 'userId fullName profilePicture role bio')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Follow.countDocuments({ follower: user._id });

    res.status(200).json({
      success: true,
      data: {
        following: following.map((f) => f.following),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFollowing: total,
          hasMore: skip + following.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching following list',
      error: error.message,
    });
  }
};

// Check if current user is following another user
export const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const userToCheck = await User.findOne({ userId: userId.toLowerCase() });

    if (!userToCheck) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isFollowing = await Follow.exists({
      follower: currentUserId,
      following: userToCheck._id,
    });

    res.status(200).json({
      success: true,
      data: {
        isFollowing: !!isFollowing,
      },
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking follow status',
      error: error.message,
    });
  }
};
