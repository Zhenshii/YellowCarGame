import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function UsernameSetupScreen() {
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const updateUsername = useMutation(api.users.setUsername);
  const isAvailable = useQuery(api.users.checkUsername, { username: usernameInput }) ?? true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await updateUsername({ username: usernameInput.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set username");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
        <p className="text-gray-600 mb-6">Choose a username to get started with the Yellow Car Game.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_-]+"
            />
            {usernameInput && !isAvailable && (
              <p className="mt-1 text-sm text-red-600">
                Username is already taken
              </p>
            )}
            {usernameInput && isAvailable && (
              <p className="mt-1 text-sm text-green-600">
                ✓ Username is available
              </p>
            )}
          </div>
          
          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={!isAvailable || !usernameInput}
            className="w-full bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
