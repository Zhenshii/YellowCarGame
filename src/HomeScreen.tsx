import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { SignOutWrapper } from "./SignOutWrapper";

export function HomeScreen() {
  const userStats = useQuery(api.spots.getUserStats);
  const recentSpots = useQuery(api.spots.getRecentSpots);
  const nextFriend = useQuery(api.spots.getNextFriend);
  const generateUploadUrl = useMutation(api.spots.generateUploadUrl);
  const addSpot = useMutation(api.spots.addSpot);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setShowConfirmation(true);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedImage) return;
    
    setIsUploading(true);
    try {
      // Get upload URL
      const postUrl = await generateUploadUrl();
      
      // Upload the file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();
      
      // Add the spot
      await addSpot({
        storageId,
        description: description.trim() || undefined,
      });

      // Reset form
      setSelectedImage(null);
      setDescription("");
      setShowConfirmation(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setDescription("");
    setShowConfirmation(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!userStats) {
    return <div className="min-h-screen bg-gray-50 p-6 animate-pulse">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
            {userStats.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {userStats.name}
            </h1>
            <p className="text-3xl font-bold text-yellow-600">
              {userStats.totalPoints.toLocaleString()} pts
            </p>
          </div>
        </div>
        <SignOutWrapper className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900" />
      </div>

      {/* Upload Section */}
      {!showConfirmation ? (
        <div className="mb-8">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-yellow-500 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:bg-yellow-600 transition-colors"
          >
            🚗 Spot one? Upload it!
          </button>
        </div>
      ) : (
        <div className="mb-8 bg-white p-4 rounded-xl shadow-md">
          {selectedImage && (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full p-2 border rounded-lg mb-4"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmUpload}
              className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Confirm Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Social Nudge */}
      {nextFriend && (
        <div className="bg-yellow-50 p-4 rounded-xl mb-8">
          <p className="text-yellow-800">
            You're only {nextFriend.pointsDiff} pts behind {nextFriend.name}! Keep going! 🔥
          </p>
        </div>
      )}

      {/* Recent Uploads */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Spots</h2>
        {recentSpots && recentSpots.length > 0 ? (
          <div className="space-y-4">
            {recentSpots.map((spot) => (
              <div
                key={spot._id}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center"
              >
                {spot.imageUrl && (
                  <img
                    src={spot.imageUrl}
                    alt="Yellow car"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(spot._creationTime, { addSuffix: true })}
                  </p>
                  {spot.description && (
                    <p className="text-gray-700 mt-1">{spot.description}</p>
                  )}
                  <p className="text-yellow-600 font-semibold mt-1">
                    +{spot.points} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-xl">
            <p className="text-gray-500">No spots yet. Start uploading!</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-lg mx-auto px-4">
          <nav className="flex justify-around py-4">
            <button className="flex flex-col items-center text-yellow-600">
              <span className="text-2xl">🏠</span>
              <span className="text-sm font-medium">Home</span>
            </button>
            <button
              onClick={() => window.location.href = "/leaderboard"}
              className="flex flex-col items-center text-gray-400"
            >
              <span className="text-2xl">🏆</span>
              <span className="text-sm">Leaderboard</span>
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
