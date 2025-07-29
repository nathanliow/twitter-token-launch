'use client';

import { useState } from 'react';
import LaunchModal from './LaunchModal';
import { TwitterPost } from '../interfaces/TwitterPost';
import { mockPosts } from '../mock/mockTwitterFeed';

export default function TwitterFeed() {
  const [selectedPost, setSelectedPost] = useState<TwitterPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLaunch = (post: TwitterPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {mockPosts.map((post) => (
        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-semibold">
                {post.author.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">{post.author}</span>
                <span className="text-gray-500 dark:text-gray-400">{post.handle}</span>
                <span className="text-gray-500 dark:text-gray-400">·</span>
                <span className="text-gray-500 dark:text-gray-400">{post.timestamp}</span>
              </div>
              <p className="text-gray-900 dark:text-white mt-2">{post.content}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
                  <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                    <span>💬</span>
                    <span>{post.replies}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                    <span>🔄</span>
                    <span>{post.retweets}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                    <span>❤️</span>
                    <span>{post.likes}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleLaunch(post)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-medium transition-colors"
                >
                  Launch
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {isModalOpen && selectedPost && (
        <LaunchModal
          post={selectedPost}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
} 