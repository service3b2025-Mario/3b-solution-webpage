import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

interface WishlistButtonProps {
  propertyId: number;
  className?: string;
}

export function WishlistButton({ propertyId, className = "" }: WishlistButtonProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  // Check if property is in wishlist
  const { data: isInWishlist } = trpc.wishlist.check.useQuery(propertyId, {
    enabled: !!user,
  });
  
  // Add to wishlist mutation
  const addMutation = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate(propertyId);
      utils.wishlist.list.invalidate();
      toast.success("Property added to wishlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to wishlist");
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
    
    // Require authentication
    if (!user) {
      toast.error("Please sign in to save properties to your wishlist", {
        action: {
          label: "Sign In",
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }
    
    // Toggle wishlist
    if (isInWishlist) {
      removeMutation.mutate(propertyId);
    } else {
      addMutation.mutate(propertyId);
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full shadow-lg ${className}`}
      onClick={handleClick}
      disabled={addMutation.isPending || removeMutation.isPending}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
    </Button>
  );
}
