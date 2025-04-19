import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useRef } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-yellow-100 p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold text-yellow-600">Yellow Car Game 🚗</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const spots = useQuery(api.spots.listSpots);
  const leaderboard = useQuery(api.spots.getLeaderboard);
  const generateUploadUrl = useMutation(api.spots.generateUploadUrl);
  const createSpot = useMutation(api.spots.createSpot);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  if (loggedInUser === undefined) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>;
  }

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
      
      await createSpot({
        storageId,
        description: description || undefined,
      });

      setSelectedImage(null);
      setDescription("");
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Unauthenticated>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-600 mb-4">Spot Yellow Cars!</h1>
          <p className="text-xl text-slate-600">Sign in to start playing</p>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Upload a Spot</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="file"
                accept="image/*"
                ref={fileInput}
                onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
                className="w-full"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                type="submit"
                disabled={!selectedImage}
                className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Upload Spot
              </button>
            </form>

            <h2 className="text-2xl font-bold mt-8 mb-4">Leaderboard</h2>
            <div className="bg-white rounded-lg shadow p-4">
              {leaderboard?.map((score, index) => (
                <div key={score._id} className="flex justify-between items-center py-2">
                  <span>#{index + 1} {score.username}</span>
                  <span>{score.totalPoints} points ({score.totalSpots} spots)</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Your Spots</h2>
            <div className="space-y-4">
              {spots?.map((spot) => (
                <div key={spot._id} className="bg-white rounded-lg shadow p-4">
                  {spot.imageUrl && (
                    <img src={spot.imageUrl} alt="Yellow car spot" className="w-full h-48 object-cover rounded mb-2" />
                  )}
                  {spot.description && <p className="text-gray-600">{spot.description}</p>}
                  <p className="text-yellow-600 font-bold">+{spot.points} points</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Authenticated>
    </div>
  );
}
