"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Heart, Zap } from "lucide-react";
import { toast } from "sonner";

interface PetCreationFormProps {
  onSuccess?: (pet: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const PET_TYPES = [
  { 
    id: "buddy", 
    name: "Learning Buddy", 
    icon: Heart, 
    description: "A friendly companion to help you learn",
    color: "text-pink-500"
  },
  { 
    id: "sage", 
    name: "Code Sage", 
    icon: Sparkles, 
    description: "A wise mentor for your coding journey",
    color: "text-purple-500" 
  },
  { 
    id: "spark", 
    name: "Energy Spark", 
    icon: Zap, 
    description: "An energetic motivator for challenges",
    color: "text-yellow-500" 
  },
];

export default function PetCreationForm({ onSuccess, onError, className }: PetCreationFormProps) {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState("buddy");
  const [loading, setLoading] = useState(false);

  // Learning Buddy creation temporarily disabled for MVP

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Learning Buddy (Paused)
        </CardTitle>
        <CardDescription>
          The Learning Buddy feature is temporarily disabled for the MVP. Data is preserved, and the feature will be re-enabled in future updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-300">
          <p className="mb-2">If you'd like to test this feature, please enable the beta feature flag or contact the dev team.</p>
          <Button asChild>
            <a href="/help" className="text-sm">Get Help</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}