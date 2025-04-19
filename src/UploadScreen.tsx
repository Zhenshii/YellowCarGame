import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function UploadScreen() {
  const generateUploadUrl = useMutation(api.spots.generateUploadUrl);
  const addSpot = useMutation(api.spots.addSpot);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowConfirmation(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    
    setIsUploading(true);
    try {
      // Get the upload URL
      const postUrl = await generateUploadUrl();
      
      // Upload the file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      
      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }
      
      const { storageId } = await result.json();
      
      // Add the spot to the database
      await addSpot({ storageId, description });
      
      // Reset form and redirect
      setSelectedImage(null);
      setDescription("");
      setPreviewUrl(null);
      setShowConfirmation(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setShowConfirmation(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload Yellow Car</h1>
      <p className="text-sm text-gray-500 mb-6">Share your spot!</p>

      {!showConfirmation ? (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            ref={fileInputRef}
            className="mb-4"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full p-2 border rounded-lg mb-4"
            rows={3}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}
          {description && (
            <p className="text-gray-700 mb-4">{description}</p>
          )}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg"
              disabled={isUploading}
            >
              Back
            </button>
            <button
              onClick={handleUpload}
              className="flex-1 py-2 px-4 bg-yellow-500 text-white rounded-lg"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Confirm Upload"}
            </button>
          </div>
        </div>
      )}

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
              <span className="text-2xl">📸</span>
              <span className="text-sm font-medium">Upload</span>
            </button>
            <button
              onClick={() => window.location.href = "/leaderboard"}
              className="flex flex-col items-center text-gray-400"
            >
              <span className="text-2xl">🏆</span>
              <span className="text-sm">Leaderboard</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
