export interface TwitterPost {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  avatar: string | null;
  image?: string;
}