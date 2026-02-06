"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ProfileSetupFormProps {
  onSuccess?: (profile: any) => void;
  onError?: (error: string) => void;
  className?: string;
  initialData?: {
    name?: string;
    image?: string;
  };
}

export default function ProfileSetupForm({ 
  onSuccess, 
  onError, 
  className,
  initialData 
}: ProfileSetupFormProps) {
  const { data: session } = useSession();
  const [name, setName] = useState(initialData?.name || session?.user?.name || "");
  const [image, setImage] = useState(initialData?.image || session?.user?.image || "");
  const [loading, setLoading] = useState(false);

  const generateAvatarUrl = (identifier: string) => {
    return `https://avatar.vercel.sh/${encodeURIComponent(identifier)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      setLoading(true);
      
      const updates: any = {
        name: name.trim(),
      };

      // If no custom image, generate one based on name
      if (!image || image.includes('avatar.vercel.sh')) {
        updates.image = generateAvatarUrl(name.trim());
      } else {
        updates.image = image;
      }

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      onSuccess?.(data.user);

    } catch (error: any) {
      const errorMessage = error.message || "Failed to update profile";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarRegenerate = () => {
    const newAvatar = generateAvatarUrl(name || "user");
    setImage(newAvatar);
    toast.success("New avatar generated!");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Setup Your Profile
        </CardTitle>
        <CardDescription>
          Personalize your eth.ed experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-blue-500/20">
                <AvatarImage 
                  src={image || generateAvatarUrl(name || "user")} 
                  alt={name || "User"} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-lg">
                  {(name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={handleAvatarRegenerate}
                disabled={loading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Click the camera icon to generate a new avatar
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Display Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              disabled={loading}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              This is how others will see you on eth.ed
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={loading || !name.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}