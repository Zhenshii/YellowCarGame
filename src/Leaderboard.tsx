import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const COLORS = [
  "bg-red-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-purple-200",
  "bg-pink-200",
];

export function Leaderboard() {
  const user = useQuery(api.users.getUser);
  const friends = useQuery(api.friends.list);

  if (!user || !friends) return null;

  // Create leaderboard data
  const leaderboard = [user, ...friends].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="p-4 max-w-lg mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
      <h2 className="text-lg text-gray-600 mb-6">Friends – The Yellow Car Game</h2>

      {/* Leaderboard List */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No friends yet!</p>
            <p>Add friends to see how you compare.</p>
          </div>
        ) : (
          <div className="divide-y">
            {leaderboard.map((entry, index) => (
              <div key={entry._id} className="flex items-center py-3">
                {/* Rank */}
                <div className="w-8 text-lg font-bold text-gray-400">
                  #{index + 1}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${COLORS[index % COLORS.length]} flex items-center justify-center text-lg font-bold`}>
                  {entry.username?.[0]?.toUpperCase()}
                </div>
                
                {/* Username */}
                <div className="flex-1 ml-3 font-medium">
                  {entry._id === user._id ? "You" : entry.username}
                </div>

                {/* Points */}
                <div className="text-lg font-bold text-yellow-600">
                  {entry.totalPoints.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
