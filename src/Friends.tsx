import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

const COLORS = [
  "bg-red-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-purple-200",
  "bg-pink-200",
];

export function Friends() {
  const [username, setUsername] = useState("");
  const friends = useQuery(api.friends.list);
  const addFriend = useMutation(api.friends.add);
  const removeFriend = useMutation(api.friends.remove);

  if (!friends) return null;

  async function handleAddFriend(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      await addFriend({ username: username.trim() });
      setUsername("");
      toast.success("Friend added!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add friend");
    }
  }

  async function handleRemoveFriend(friendId: Id<"userScores">) {
    try {
      await removeFriend({ friendId });
      toast.success("Friend removed");
    } catch (error) {
      toast.error("Failed to remove friend");
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-2">Friends</h1>
      <h2 className="text-lg text-gray-600 mb-6">Add friends to compete with!</h2>

      {/* Add Friend Form */}
      <form onSubmit={handleAddFriend} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium disabled:opacity-50"
          >
            Add ➕
          </button>
        </div>
      </form>

      {/* Friends List */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {friends.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't added any friends yet.</p>
            <p>Add one to compete!</p>
          </div>
        ) : (
          <div className="divide-y">
            {friends.map((friend, index) => (
              <div key={friend._id} className="flex items-center py-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${COLORS[index % COLORS.length]} flex items-center justify-center text-lg font-bold`}>
                  {friend.username && friend.username[0].toUpperCase()}
                </div>
                
                {/* Username */}
                <div className="flex-1 ml-3 font-medium">
                  {friend.username}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFriend(friend._id)}
                  className="text-gray-400 hover:text-red-500 p-2"
                  title="Remove friend"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
