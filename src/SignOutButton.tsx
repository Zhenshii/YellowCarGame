interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const handleSignOut = () => {
    // Clear any auth tokens
    localStorage.clear();
    // Navigate to sign in page
    window.location.href = "/";
  };

  return (
    <button onClick={handleSignOut} className={className}>
      Sign Out
    </button>
  );
}
