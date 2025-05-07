interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const handleSignOut = () => {
    window.location.href = "/";
  };

  return (
    <button onClick={handleSignOut} className={className}>
      Sign Out
    </button>
  );
}
