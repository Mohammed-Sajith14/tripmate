import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Users, Building2, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

interface UserProfile {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  role: string;
  organizationName?: string;
  organizationLocation?: string;
  organizationDescription?: string;
  followersCount: number;
  followingCount: number;
  stats: {
    tripsCreated?: number;
    tripsJoined?: number;
    countriesVisited?: number;
    reviews?: number;
    rating?: number;
  };
  createdAt: string;
}

export function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    fetchProfile();
    checkFollowStatus();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setFollowersCount(data.data.followersCount || 0);
      } else {
        toast.error('Failed to load user profile');
        onClose();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/follow/${userId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    setIsFollowLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = isFollowing
        ? `http://localhost:5000/api/follow/${userId}/unfollow`
        : `http://localhost:5000/api/follow/${userId}/follow`;
      
      const response = await fetch(url, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
        toast.success(isFollowing ? 'Unfollowed successfully' : 'Following successfully');
        
        // Fetch updated current user data to refresh following count in localStorage
        const meResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (meResponse.ok) {
          const meData = await meResponse.json();
          localStorage.setItem('user', JSON.stringify(meData.data));
          // Dispatch event to update UI
          window.dispatchEvent(new Event('userFollowUpdated'));
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Error updating follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
          <Loader2 className="size-8 animate-spin text-teal-500 mx-auto" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            User Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="size-5 text-slate-500" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="size-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={profile.profilePicture ? {
                backgroundImage: `url(${profile.profilePicture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
              {!profile.profilePicture && (
                <span className="text-2xl text-slate-600 dark:text-slate-300 font-medium">
                  {profile.fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {profile.fullName}
                </h3>
                {profile.role === 'organizer' && (
                  <Building2 className="size-5 text-teal-500" />
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                @{profile.userId}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {followersCount}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">
                    followers
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {profile.followingCount || 0}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">
                    following
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFollow}
              disabled={isFollowLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isFollowing
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              {isFollowLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus className="size-4" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Follow
                </>
              )}
            </button>
          </div>

          {/* Role Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              profile.role === 'organizer'
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {profile.role === 'organizer' ? <Building2 className="size-4" /> : <Users className="size-4" />}
              {profile.role === 'organizer' ? 'Trip Organizer' : 'Traveler'}
            </span>
          </div>

          {/* Organizer Info */}
          {profile.role === 'organizer' && profile.organizationName && (
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-teal-900 dark:text-teal-300 mb-2">
                {profile.organizationName}
              </h4>
              {profile.organizationLocation && (
                <p className="text-sm text-teal-700 dark:text-teal-400 flex items-center gap-1 mb-2">
                  <MapPin className="size-4" />
                  {profile.organizationLocation}
                </p>
              )}
              {profile.organizationDescription && (
                <p className="text-sm text-teal-800 dark:text-teal-300">
                  {profile.organizationDescription}
                </p>
              )}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">About</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Location */}
          {profile.location && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="size-4" />
                {profile.location}
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="size-4" />
              Member since {memberSince}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {profile.role === 'organizer' && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile.stats.tripsCreated || 0}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Trips Created
                </p>
              </div>
            )}
            {profile.role === 'traveler' && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile.stats.tripsJoined || 0}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Trips Joined
                </p>
              </div>
            )}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile.stats.countriesVisited || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Countries Visited
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
