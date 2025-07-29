import { TwitterPost } from "../interfaces/TwitterPost";

export const mockPosts: TwitterPost[] = [
  {
    id: '1',
    author: 'Zach Warunek',
    handle: '@ZachWarunek',
    content: 'Just launched my new token! 🚀 The community response has been incredible. This is just the beginning of something amazing.',
    timestamp: '2h',
    likes: 1247,
    retweets: 89,
    replies: 23,
    avatar: '/avatars/zach.jpg'
  },
  {
    id: '2',
    author: 'Crypto Builder',
    handle: '@CryptoBuilder',
    content: 'Building the future of DeFi one token at a time. The possibilities are endless when you have the right tools! 💎',
    timestamp: '4h',
    likes: 892,
    retweets: 156,
    replies: 45,
    avatar: '/avatars/builder.jpg'
  },
  {
    id: '3',
    author: 'Token Master',
    handle: '@TokenMaster',
    content: 'New token launch incoming! Get ready for the next big thing in the Solana ecosystem. 🎯',
    timestamp: '6h',
    likes: 2103,
    retweets: 234,
    replies: 67,
    avatar: '/avatars/master.jpg'
  }
];
