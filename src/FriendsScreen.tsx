import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function FriendsScreen() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
      <p className="text-sm text-gray-500 mb-6">The Yellow Car Game</p>

      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <p className="text-gray-900 font-medium mb-2">Coming Soon!</p>
        <p className="text-sm text-gray-500">
          Friend functionality will be added in a future update.
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-lg mx-auto px-4">
          <nav className="flex justify-around py-4">
            <button
              onClick={() => window.location.href = "/"}
              className="flex flex-col items-center text-gray-400"
            >
              <span className="text-2xl">🏠</span>
              <span className="text-sm">Home</span>
            </button>
            <button
              onClick={() => window.location.href = "/leaderboard"}
              className="flex flex-col items-center text-gray-400"
            >
              <span className="text-2xl">🏆</span>
              <span className="text-sm">Leaderboard</span>
            </button>
            <button className="flex flex-col items-center text-yellow-600">
              <span className="text-2xl">👥</span>
              <span className="text-sm font-medium">Friends</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
