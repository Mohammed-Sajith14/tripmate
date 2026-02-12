import { useState, useEffect } from "react";
import { PostCard } from "./PostCard";
import { Post } from "./types";
import { toast } from "sonner";

interface SocialFeedProps {
  limit?: number;
}

export function SocialFeed({ limit }: SocialFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();

    // Listen for new post events
    const handleNewPost = () => {
      fetchPosts();
    };
    window.addEventListener('postCreated', handleNewPost);
    
    return () => {
      window.removeEventListener('postCreated', handleNewPost);
    };
  }, [limit]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts/feed', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform backend data to match frontend Post type
        const transformedPosts: Post[] = data.data.posts.map((post: any) => ({
          id: post._id,
          author: {
            id: post.author.userId,
            name: post.author.fullName,
            avatar: post.author.profilePicture || undefined,
          },
          authorId: post.author._id,
          caption: post.content,
          location: post.location,
          images: post.images || [],
          likes: post.likesCount,
          isLiked: post.isLikedByCurrentUser,
          comments: [],
          timeAgo: getTimeAgo(post.createdAt),
        }));

        const limitedPosts = limit ? transformedPosts.slice(0, limit) : transformedPosts;
        setPosts(limitedPosts);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const post = posts.find(p => p.id === postId);
      
      if (!post) return;

      const endpoint = post.isLiked 
        ? `http://localhost:5000/api/posts/${postId}/unlike`
        : `http://localhost:5000/api/posts/${postId}/like`;
      
      const method = post.isLiked ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Optimistic update
        setPosts(
          posts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                isLiked: !p.isLiked,
                likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              };
            }
            return p;
          })
        );
      } else {
        toast.error('Failed to update like');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to update like');
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add comment to local state
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              const newComment = {
                id: data.comment._id,
                author: { 
                  id: userData.userId, 
                  name: userData.fullName,
                  avatar: userData.profilePicture,
                },
                text: commentText,
                timeAgo: "Just now",
              };
              toast.success("Comment added!");
              return {
                ...post,
                comments: [...post.comments, newComment],
              };
            }
            return post;
          })
        );
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        toast.success('Post deleted successfully');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              </div>
            </div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onDelete={handleDelete}
          currentUserId={JSON.parse(localStorage.getItem('user') || '{}')._id}
        />
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            No posts to show yet. Follow travelers to see their posts!
          </p>
        </div>
      )}
    </div>
  );
}
