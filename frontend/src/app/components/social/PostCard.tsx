import { useState } from "react";
import { Heart, MessageCircle, MapPin, MoreHorizontal, Send } from "lucide-react";
import { Post } from "./types";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onDelete?: (postId: string) => void;
  currentUserId?: string;
}

export function PostCard({ post, onLike, onComment, onDelete, currentUserId }: PostCardProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  const handleLike = () => {
    onLike(post.id);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText("");
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const isOwnPost = currentUserId && post.authorId && currentUserId === post.authorId;

  const visibleComments = showAllComments
    ? post.comments
    : post.comments.slice(0, 2);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
            {post.author.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {post.author.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{post.timeAgo}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {isOwnPost && (
          <button 
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
        )}
      </div>

      {/* Post Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-slate-900 dark:text-white">{post.caption}</p>
        </div>
      )}

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div
          className={`grid gap-1 ${
            post.images.length === 1
              ? "grid-cols-1"
              : post.images.length === 2
              ? "grid-cols-2"
              : post.images.length === 3
              ? "grid-cols-2"
              : "grid-cols-2"
          }`}
        >
          {post.images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`relative ${
                post.images.length === 3 && index === 0 ? "col-span-2" : ""
              } ${
                post.images.length > 4 && index === 3 ? "relative" : ""
              } aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800`}
            >
              <img
                src={image}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
              {post.images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    +{post.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4 space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 group"
          >
            <Heart
              className={`w-6 h-6 transition-all ${
                post.isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-slate-600 dark:text-slate-400 group-hover:text-red-500"
              }`}
            />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {post.likes}
            </span>
          </button>
          <button
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-2 group"
          >
            <MessageCircle className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-teal-500 transition-colors" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {post.comments.length}
            </span>
          </button>
        </div>

        {/* Comments Section */}
        {post.comments.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {comment.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {comment.author.name}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                      {comment.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-3">
                    <button className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-500 font-medium">
                      Like
                    </button>
                    <span className="text-xs text-slate-400">
                      {comment.timeAgo}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {post.comments.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-teal-500 font-medium"
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}

        {/* Comment Input */}
        {showCommentInput && (
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              Y
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="p-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 disabled:cursor-not-allowed text-white rounded-full transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
