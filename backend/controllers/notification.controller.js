import Notification from '../models/Notification.model.js';
import Booking from '../models/Booking.model.js';
import Review from '../models/Review.model.js';

const ensurePendingReviewNotifications = async (travelerId) => {
  const bookings = await Booking.find({ traveler: travelerId, status: 'confirmed' })
    .populate('trip', 'title endDate')
    .lean();

  const now = new Date();
  const completedBookings = bookings.filter((booking) => {
    const tripEndDate = booking?.trip?.endDate ? new Date(booking.trip.endDate) : null;
    return tripEndDate && tripEndDate <= now;
  });

  if (!completedBookings.length) {
    return;
  }

  const tripIds = completedBookings.map((booking) => booking.trip?._id).filter(Boolean);
  const completedTripIds = completedBookings.map((booking) => booking.trip?._id).filter(Boolean);

  const [existingReviews, existingNotifications] = await Promise.all([
    Review.find({ reviewer: travelerId, trip: { $in: tripIds } }).select('trip').lean(),
    Notification.find({
      recipient: travelerId,
      type: 'review',
      relatedId: { $in: completedTripIds },
    })
      .select('relatedId')
      .lean(),
  ]);

  const reviewedTripIdSet = new Set(existingReviews.map((review) => String(review.trip)));
  const notifiedTripIdSet = new Set(
    existingNotifications.map((notification) => String(notification.relatedId))
  );

  const docsToCreate = [];

  for (const booking of completedBookings) {
    const tripId = String(booking.trip?._id || '');
    if (!tripId || reviewedTripIdSet.has(tripId) || notifiedTripIdSet.has(tripId)) {
      continue;
    }

    const title = booking.trip?.title || 'your trip';

    docsToCreate.push({
      recipient: travelerId,
      sender: booking.organizer,
      type: 'review',
      message: `Your trip "${title}" is complete. Please rate and review the organizer.`,
      relatedId: booking.trip._id,
      isRead: false,
    });
  }

  if (docsToCreate.length) {
    await Notification.insertMany(docsToCreate, { ordered: false });
  }
};

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    if (req.user?.role === 'traveler') {
      await ensurePendingReviewNotifications(userId);
    }

    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'userId fullName profilePicture role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasMore: skip + notifications.length < total,
        },
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user?.role === 'traveler') {
      await ensurePendingReviewNotifications(userId);
    }

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};
