"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
  const router = useRouter();
  
  const handleSignOut = async function signOutBut() {
    try {
      await signOut({ redirect: false });
      toast.success("Signed out successfully!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(`Sign-out error: ${error.message || "Unknown error"}`);
    }
  };
  
  return handleSignOut;
}