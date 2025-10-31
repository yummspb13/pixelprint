"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page with contact anchor
    router.push("/#footer");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to contact section...</p>
    </div>
  );
}

