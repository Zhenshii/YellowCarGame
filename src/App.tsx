import { useConvexAuth } from "convex/react";
import { SignInForm } from "./SignInForm";
import { HomeScreen } from "./HomeScreen";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { FriendsScreen } from "./FriendsScreen";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  // Simple client-side routing
  const path = window.location.pathname;

  if (path === "/leaderboard") {
    return <LeaderboardScreen />;
  }

  if (path === "/friends") {
    return <FriendsScreen />;
  }

  return <HomeScreen />;
}
