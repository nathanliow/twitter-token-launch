'use client';

import { useState, useEffect, useRef } from 'react';
import LaunchModal from './LaunchModal';
import { TwitterPost } from '../interfaces/TwitterPost';
import { mockPosts } from '../mock/mockTwitterFeed';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Extended interface for displayed posts with unique keys
interface DisplayedPost extends TwitterPost {
  displayKey: string;
}

export default function TwitterFeed() {
  const [selectedPost, setSelectedPost] = useState<TwitterPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState<DisplayedPost[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [shuffledPosts, setShuffledPosts] = useState<TwitterPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize shuffled posts when component mounts
  useEffect(() => {
    const shuffled = shuffleArray(mockPosts);
    setShuffledPosts(shuffled);
    setDisplayedPosts([{
      ...shuffled[0],
      displayKey: `${shuffled[0].id}-${Date.now()}-0`
    }]);
    setCurrentIndex(1);
  }, []);

  useEffect(() => {
    if (shuffledPosts.length === 0) return;
    
    intervalRef.current = setInterval(() => {
      setDisplayedPosts(currentPosts => {
        const nextPost = shuffledPosts[currentIndex % shuffledPosts.length];
        return [{
          ...nextPost,
          displayKey: `${nextPost.id}-${Date.now()}-${Math.random()}`
        }, ...currentPosts];
      });
      
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= shuffledPosts.length) {
          setShuffledPosts(shuffleArray(mockPosts));
          return 0;
        }
        return nextIndex;
      });
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [shuffledPosts, currentIndex]);

  // Handle hover pause/resume
  useEffect(() => {
    if (isHovered) {
      // Pause the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Resume the interval
      if (!intervalRef.current && shuffledPosts.length > 0) {
        intervalRef.current = setInterval(() => {
          setDisplayedPosts(currentPosts => {
            const nextPost = shuffledPosts[currentIndex % shuffledPosts.length];
            return [{
              ...nextPost,
              displayKey: `${nextPost.id}-${Date.now()}-${Math.random()}`
            }, ...currentPosts];
          });
          
          setCurrentIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            // If we've gone through all posts, reshuffle for next cycle
            if (nextIndex >= shuffledPosts.length) {
              setShuffledPosts(shuffleArray(mockPosts));
              return 0;
            }
            return nextIndex;
          });
        }, 3000);
      }
    }
  }, [isHovered, shuffledPosts, currentIndex]);



  const handleLaunch = (post: TwitterPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // The useEffect will handle resuming the interval
  };

  return (
    <div className="relative">
      <div
        className="h-[calc(100vh-200px)] overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 p-4 space-y-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Pause indicator */}
        {isHovered && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-3 rounded shadow-lg">
            <div className="flex items-center">
              <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                ⏸️ Feed paused
              </span>
            </div>
          </div>
        )}

        {displayedPosts.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <span>Loading first post...</span>
          </div>
        ) : (
          displayedPosts.map((post) => (
            <div key={post.displayKey} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-semibold">
                    {post.avatar !== null ? (
                      <img 
                        src={post.avatar} 
                        alt={post.author.charAt(0)}
                        className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-300 font-semibold">
                        {post.author.charAt(0)}
                      </span>
                    )}
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
                  {post.image && (
                    <div className="mt-3">
                      <img 
                        src={post.image} 
                        alt="Post image" 
                        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  )}
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
                      className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-full font-medium transition-colors"
                    >
                      Launch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {isModalOpen && selectedPost && (
        <LaunchModal
          post={selectedPost}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
} 