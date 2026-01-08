import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, GripVertical, MessageSquare } from "lucide-react";

interface SortableImageItemWithCaptionProps {
  id: string;
  url: string;
  index: number;
  isMain: boolean;
  caption?: string;
  onRemove: () => void;
  onCaptionChange: (caption: string) => void;
}

export function SortableImageItemWithCaption({ 
  id, 
  url, 
  index, 
  isMain, 
  caption = "",
  onRemove,
  onCaptionChange 
}: SortableImageItemWithCaptionProps) {
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [localCaption, setLocalCaption] = useState(caption);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCaptionSave = () => {
    onCaptionChange(localCaption);
    setShowCaptionInput(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-card rounded-lg overflow-hidden border border-border group"
    >
      {/* Image */}
      <div className="aspect-square relative">
        <img
          src={url}
          alt={`Property ${index + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm p-1.5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>

        {/* Delete Button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Badge */}
        {isMain && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded font-medium">
            Main
          </div>
        )}

        {/* Caption Indicator */}
        {caption && !showCaptionInput && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span className="max-w-[100px] truncate">{caption}</span>
          </div>
        )}
      </div>

      {/* Caption Input */}
      {showCaptionInput ? (
        <div className="p-2 bg-muted">
          <Input
            type="text"
            placeholder="Add caption..."
            value={localCaption}
            onChange={(e) => setLocalCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCaptionSave();
              if (e.key === 'Escape') setShowCaptionInput(false);
            }}
            className="text-xs h-7 mb-1"
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              onClick={handleCaptionSave}
              className="h-6 text-xs flex-1"
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowCaptionInput(false)}
              className="h-6 text-xs flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCaptionInput(true)}
          className="w-full p-2 text-xs text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
        >
          <MessageSquare className="w-3 h-3" />
          {caption ? 'Edit caption' : 'Add caption'}
        </button>
      )}
    </div>
  );
}
