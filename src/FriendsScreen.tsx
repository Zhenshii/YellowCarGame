import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function FriendsScreen() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useQuery(api.users.searchUsers, { query: searchQuery });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
      <p className="text-sm text-gray-500 mb-6">The Yellow Car Game</p>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Friend</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full p-2 border rounded-lg mb-4"
            />
            
            <div className="space-y-2 mb-4">
              {searchResults?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{user.name}</span>
                  <button className="text-yellow-600 font-medium">
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <p className="text-gray-900 font-medium mb-2">No friends yet!</p>
        <p className="text-sm text-gray-500">
          Search for friends to start competing together.
        </p>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:bg-yellow-600 transition-colors"
      >
        +
      </button>

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
