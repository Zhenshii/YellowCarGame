import { useConvexAuth } from "convex/react";
import { SignOutButton } from "./SignOutButton";

interface SignOutWrapperProps {
  className?: string;
}

export function SignOutWrapper({ className }: SignOutWrapperProps) {
  const { isAuthenticated } = useConvexAuth();
  
  const handleSignOut = () => {
    if (isAuthenticated) {
      // Clear any client-side state if needed
      localStorage.clear();
      sessionStorage.clear();
      
      // Refresh the page to ensure clean state
      window.location.reload();
    }
  };

  return (
    <div onClick={handleSignOut}>
      <SignOutButton className={className} />
    </div>
  );
}
