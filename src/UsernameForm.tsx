import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

export function UsernameForm() {
  const [usernameInput, setUsernameInput] = useState("");
  const setUsername = useMutation(api.users.setUsername);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    try {
      await setUsername({ username: usernameInput.trim() });
      toast.success("Username set successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set username");
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">Choose a Username</h2>
      <p className="text-gray-600 mb-6">
        Pick a unique username to play The Yellow Car Game!
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="Enter username"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          type="submit"
          disabled={!usernameInput.trim()}
          className="w-full py-2 bg-yellow-500 text-white rounded-lg font-medium disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
