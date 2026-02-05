"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  createdAt: string;
  wallets: WalletAddress[];
  pets?: Pet[]; // optional for MVP where buddy is disabled
  courses: UserCourse[];
  stats: {
    coursesEnrolled: number;
    purchasesMade: number;
    nftsOwned: number;
  };
}

interface WalletAddress {
  id: string;
  address: string;
  chainId: number;
  isPrimary: boolean;
  ensName?: string;
  ensAvatar?: string;
  createdAt: string;
}

interface Pet {
  id: string;
  name: string;
  level: number;
  experience: number;
  state: any;
  createdAt: string;
  updatedAt: string;
}

interface UserCourse {
  id: string;
  progress: number;
  completed: boolean;
  startedAt: string;
  finishedAt?: string;
  course: {
    id: string;
    title: string;
    slug: string;
    level: string;
  };
}

export function useUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      setProfile(data.user);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, "name" | "image">>) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await fetchProfile(); // Refresh profile data
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error("Failed to update profile");
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}