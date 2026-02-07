import { useState } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { VisitorLoginModal } from "./VisitorLoginModal";

interface WishlistButtonProps {
  propertyId: number;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function WishlistButton({ propertyId, className = "", size = "default" }: WishlistButtonProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Check if property is in wishlist
  const { data: isInWishlist } = trpc.wishlist.check.useQuery(propertyId, {
    enabled: !!user,
  });
  
  // Add to wishlist mutation
  const addMutation = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate(propertyId);
      utils.wishlist.list.invalidate();
      toast.success("Property added to your wishlist", {
        description: "You can view your saved properties anytime.",
      });
    },
    onError: (error) => {
      if (error.message?.includes("Already in wishlist")) {
        toast.info("This property is already in your wishlist");
      } else {
        toast.error(error.message || "Failed to add to wishlist");
      }
    },
  });
  
  // Remove from wishlist mutation
  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate(propertyId);
      utils.wishlist.list.invalidate();
      toast.success("Property removed from wishlist");
    },
  });
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // If not authenticated, show visitor login modal
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Toggle wishlist
    if (isInWishlist) {
      removeMutation.mutate(propertyId);
    } else {
      addMutation.mutate(propertyId);
    }
  };

  const handleLoginSuccess = () => {
    // After login, the page will reload and the user can click the heart again
    // The modal handles the reload automatically
  };

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${className}`}
        onClick={handleClick}
        disabled={addMutation.isPending || removeMutation.isPending}
        title={isInWishlist ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart
          className={`${iconSize} transition-all duration-300 ${
            isInWishlist 
              ? "fill-red-500 text-red-500 scale-110" 
              : "text-gray-600 hover:text-red-400"
          }`}
        />
      </Button>

      {/* Render modal via portal at document.body level to prevent click events 
          from bubbling through the React component tree to the property card */}
      {createPortal(
        <VisitorLoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onSuccess={handleLoginSuccess}
          triggerContext="wishlist"
        />,
        document.body
      )}
    </>
  );
}
