"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CalculatePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page with calculator anchor
    router.push("/#quick-quote");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to calculator...</p>
    </div>
  );
}

