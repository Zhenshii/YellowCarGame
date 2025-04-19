import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useRef } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Unauthenticated>
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-yellow-600 mb-4">Yellow Car Game</h1>
          <p className="text-xl text-slate-600 mb-8">Sign in to start playing</p>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <HomeScreen />
      </Authenticated>
      <Toaster />
    </div>
  );
}

function HomeScreen() {
  const stats = useQuery(api.spots.getUserStats);
  const recentSpots = useQuery(api.spots.getRecentSpots) ?? [];
  const generateUploadUrl = useMutation(api.spots.generateUploadUrl);
  const createSpot = useMutation(api.spots.createSpot);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!stats) return null;

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedImage) return;

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      const { storageId } = await result.json();
      
      await createSpot({ storageId });
      setSelectedImage(null);
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  function formatTimeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-800 font-bold">
            {stats.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold">Welcome back, {stats.username}!</h1>
            <p className="text-3xl font-bold text-yellow-600">{stats.totalPoints} pts</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      {/* Upload Button */}
      <form onSubmit={handleUpload} className="space-y-4">
        <label 
          className="block w-full py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-center rounded-xl cursor-pointer text-white font-bold shadow-lg hover:shadow-xl transition-all"
        >
          🚗 Spot one? Upload it!
          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
        {selectedImage && (
          <button
            type="submit"
            className="w-full py-2 bg-green-500 text-white rounded-lg font-medium"
          >
            Submit Photo
          </button>
        )}
      </form>

      {/* Social Nudge */}
      {stats.nextFriend && (
        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-blue-800">
            You're only {stats.nextFriend.pointsDiff} pts behind {stats.nextFriend.username}! Keep going! 🔥
          </p>
        </div>
      )}

      {/* Recent Uploads */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Spots</h2>
        {recentSpots.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No spots yet! Get out there and find some yellow cars! 🚕
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {recentSpots.map((spot) => (
              <div key={spot._id} className="relative rounded-lg overflow-hidden bg-white shadow">
                {spot.imageUrl && (
                  <img 
                    src={spot.imageUrl} 
                    alt="Yellow car spot" 
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                  <div>+{spot.points} pts</div>
                  <div className="text-xs opacity-75">{formatTimeAgo(spot.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="max-w-lg mx-auto px-4 flex justify-around">
          <button className="p-2 text-yellow-600 font-medium">Home</button>
          <button className="p-2 text-gray-500">Upload</button>
          <button className="p-2 text-gray-500">Profile</button>
        </div>
      </nav>
    </div>
  );
}
