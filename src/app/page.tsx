import TwitterFeed from './components/TwitterFeed';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover & Launch Tokens
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet and launch tokens from your favorite Twitter posts
          </p>
        </div>
        
        <TwitterFeed />
      </div>
    </div>
  );
}
