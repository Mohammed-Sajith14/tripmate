export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  timeAgo: string;
}

export interface Post {
  id: string;
  author: User;
  authorId?: string;
  caption?: string;
  location?: string;
  images: string[];
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  timeAgo: string;
}
