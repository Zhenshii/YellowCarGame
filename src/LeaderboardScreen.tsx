import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function LeaderboardScreen() {
  const leaderboard = useQuery(api.spots.getLeaderboard);

  if (!leaderboard) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-sm text-gray-500 mb-6">Friends – The Yellow Car Game</p>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-4 bg-gray-200 rounded"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-sm text-gray-500 mb-6">Friends – The Yellow Car Game</p>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-gray-900 font-medium mb-2">No friends yet!</p>
          <p className="text-sm text-gray-500">
            Start spotting yellow cars to join the competition.
          </p>
        </div>
      </div>
    );
  }

  // Generate a consistent color based on the username
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
      <p className="text-sm text-gray-500 mb-6">Friends – The Yellow Car Game</p>

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center p-4 ${
              entry.isCurrentUser ? "bg-yellow-50" : ""
            }`}
          >
            {/* Rank */}
            <div className="w-8 text-gray-500 font-medium">
              #{index + 1}
            </div>

            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(
                entry.name
              )}`}
            >
              {getInitials(entry.name)}
            </div>

            {/* Name */}
            <div className="flex-1 ml-4">
              <span className="font-medium text-gray-900">
                {entry.isCurrentUser ? "You" : entry.name}
              </span>
            </div>

            {/* Points */}
            <div className="text-right">
              <span className="font-medium text-gray-900">
                {entry.totalPoints.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm ml-1">pts</span>
            </div>
          </div>
        ))}
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
            <button className="flex flex-col items-center text-yellow-600">
              <span className="text-2xl">🏆</span>
              <span className="text-sm font-medium">Leaderboard</span>
            </button>
            <button
              onClick={() => window.location.href = "/friends"}
              className="flex flex-col items-center text-gray-400"
            >
              <span className="text-2xl">👥</span>
              <span className="text-sm">Friends</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
