import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import Follow from '../models/Follow.model.js';
import Notification from '../models/Notification.model.js';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, images, location, destination } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Post content is required',
      });
    }

    const post = await Post.create({
      author: userId,
      content: content.trim(),
      images: images || [],
      location,
      destination,
      isPublic: true,
    });

    // Populate author info
    await post.populate('author', 'userId fullName profilePicture role');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message,
    });
  }
};

// Get feed (posts from followed users + own posts)
export const getFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get list of users the current user follows
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);
    
    // Include current user's posts too
    followingIds.push(userId);

    // Get posts from followed users and self
    const posts = await Post.find({
      author: { $in: followingIds },
      isPublic: true,
    })
      .populate('author', 'userId fullName profilePicture role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Check which posts current user has liked
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLikedByCurrentUser: post.likes.some(
        likeId => likeId.toString() === userId.toString()
      ),
    }));

    const total = await Post.countDocuments({
      author: { $in: followingIds },
      isPublic: true,
    });

    res.status(200).json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasMore: skip + posts.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feed',
      error: error.message,
    });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await mongoose.model('User').findOne({ userId: userId.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const posts = await Post.find({
      author: user._id,
      isPublic: true,
    })
      .populate('author', 'userId fullName profilePicture role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Post.countDocuments({
      author: user._id,
      isPublic: true,
    });

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasMore: skip + posts.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message,
    });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if already liked
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'Post already liked',
      });
    }

    // Add like
    post.likes.push(userId);
    post.likesCount += 1;
    await post.save();

    // Create notification for post author (if not liking own post)
    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'like',
        message: 'liked your post',
        relatedId: post._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: {
        likesCount: post.likesCount,
      },
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking post',
      error: error.message,
    });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if liked
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Post not liked yet',
      });
    }

    // Remove like
    post.likes.splice(likeIndex, 1);
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post unliked successfully',
      data: {
        likesCount: post.likesCount,
      },
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unliking post',
      error: error.message,
    });
  }
};

// Add comment to post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content: content.trim(),
    });

    // Increment comment count
    post.commentsCount += 1;
    await post.save();

    // Populate author info
    await comment.populate('author', 'userId fullName profilePicture role');

    // Create notification for post author (if not commenting on own post)
    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'comment',
        message: 'commented on your post',
        relatedId: post._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message,
    });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'userId fullName profilePicture role')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Comment.countDocuments({ post: postId });

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalComments: total,
          hasMore: skip + comments.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message,
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
    }

    // Delete all comments for this post
    await Comment.deleteMany({ post: postId });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message,
    });
  }
};
