import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Video, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import imageCompression from 'browser-image-compression';
import { addWatermark } from '@/lib/watermark';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableImageItemWithCaption } from './SortableImageItemWithCaption';

interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'tour';
  name?: string;
}

interface MediaUploadProps {
  images?: string[];
  imageCaptions?: Record<string, string>;
  videoUrl?: string;
  virtualTourUrl?: string;
  onImagesChange: (urls: string[]) => void;
  onImageCaptionsChange?: (captions: Record<string, string>) => void;
  onVideoChange: (url: string) => void;
  onVirtualTourChange: (url: string) => void;
  maxImages?: number;
  enableWatermark?: boolean;
}

export function MediaUpload({ 
  images = [],
  imageCaptions = {},
  videoUrl = "",
  virtualTourUrl = "",
  onImagesChange,
  onImageCaptionsChange,
  onVideoChange,
  onVirtualTourChange,
  maxImages = 20,
  enableWatermark = true
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [tourUrlInput, setTourUrlInput] = useState(virtualTourUrl);
  
  const uploadImageMutation = trpc.storage.uploadImage.useMutation();
  const uploadVideoMutation = trpc.storage.uploadVideo.useMutation();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const imageFiles: File[] = [];
      const videoFiles: File[] = [];
      
      // Separate images and videos
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        } else if (file.type.startsWith('video/')) {
          videoFiles.push(file);
        }
      });

      // Upload images
      if (imageFiles.length > 0) {
        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
          alert(`Maximum ${maxImages} images allowed`);
          return;
        }

        const imagesToUpload = imageFiles.slice(0, remainingSlots);
        
        const imagePromises = imagesToUpload.map(async (file) => {
          // Add watermark if enabled
          let processedFile = file;
          if (enableWatermark) {
            try {
              processedFile = await addWatermark(file, '3B Solution', 0.3);
              console.log(`Watermark added to ${file.name}`);
            } catch (error) {
              console.warn('Watermarking failed, using original file:', error);
            }
          }

          // Compress image after watermarking
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: processedFile.type as 'image/jpeg' | 'image/png' | 'image/webp'
          };
          
          let compressedFile = processedFile;
          try {
            compressedFile = await imageCompression(processedFile, options);
            console.log(`Compressed ${processedFile.name} from ${(processedFile.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          } catch (error) {
            console.warn('Compression failed, using original file:', error);
          }

          // Validate file size after compression (5MB limit)
          if (compressedFile.size > 5 * 1024 * 1024) {
            throw new Error(`${file.name} exceeds 5MB size limit even after compression`);
          }

          // Convert compressed file to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
          });

          const result = await uploadImageMutation.mutateAsync({
            filename: compressedFile.name,
            contentType: compressedFile.type,
            data: base64
          });

          return result.url;
        });

        const uploadedImageUrls = await Promise.all(imagePromises);
        onImagesChange([...images, ...uploadedImageUrls]);
      }

      // Upload videos (only first video, replace existing)
      if (videoFiles.length > 0) {
        const videoFile = videoFiles[0];
        
        // Validate file size (50MB limit for videos)
        if (videoFile.size > 50 * 1024 * 1024) {
          alert(`${videoFile.name} exceeds 50MB size limit. For larger videos, please upload to YouTube/Vimeo and paste the URL.`);
          return;
        }

        // Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(videoFile);
        });

        const result = await uploadVideoMutation.mutateAsync({
          filename: videoFile.name,
          contentType: videoFile.type,
          data: base64
        });

        onVideoChange(result.url);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange, onVideoChange, uploadImageMutation, uploadVideoMutation]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      const newImages = arrayMove(images, oldIndex, newIndex);
      onImagesChange(newImages);
    }
  }, [images, onImagesChange]);

  const removeVideo = useCallback(() => {
    onVideoChange("");
  }, [onVideoChange]);

  const handleTourUrlSave = useCallback(() => {
    onVirtualTourChange(tourUrlInput);
  }, [tourUrlInput, onVirtualTourChange]);

  return (
    <div className="space-y-6">
      {/* Unified Upload Area */}
      <div>
        <label className="text-sm font-medium mb-3 block">Property Media</label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="media-upload"
            multiple
            accept="image/*,video/*"
            onChange={handleChange}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4">
              <ImageIcon className="w-10 h-10 text-primary" />
              <Video className="w-10 h-10 text-secondary" />
              <Globe className="w-10 h-10 text-accent" />
            </div>
            <div className="text-sm">
              <label 
                htmlFor="media-upload" 
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Click to upload
              </label>
              {' '}or drag and drop
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Photos:</strong> PNG, JPG, WEBP up to 5MB ({images.length}/{maxImages} images)</p>
              <p><strong>Videos:</strong> MP4, MOV, AVI up to 50MB (or paste YouTube/Vimeo URL below)</p>
              <p><strong>360° Tours:</strong> Paste Matterport, Kuula, or other tour URL below</p>
            </div>
          </div>

          {uploading && (
            <div className="mt-4 text-sm text-primary font-medium">
              Uploading media...
            </div>
          )}
        </div>
      </div>

      {/* Image Previews with Drag-and-Drop */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Photos ({images.length}) - Drag to reorder</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((url, index) => (
                  <SortableImageItemWithCaption
                    key={url}
                    id={url}
                    url={url}
                    index={index}
                    isMain={index === 0}
                    caption={imageCaptions[url] || ""}
                    onRemove={() => removeImage(index)}
                    onCaptionChange={(caption) => {
                      if (onImageCaptionsChange) {
                        const newCaptions = { ...imageCaptions, [url]: caption };
                        onImageCaptionsChange(newCaptions);
                      }
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Video Section */}
      <div>
        <h4 className="text-sm font-medium mb-3">Property Video</h4>
        {videoUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-border group">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Video className="w-6 h-6" />
                  <span className="text-sm">Video URL: {videoUrl.substring(0, 50)}...</span>
                </div>
              ) : (
                <video src={videoUrl} controls className="w-full h-full" />
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeVideo}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <Video className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No video uploaded</p>
            <p className="text-xs text-muted-foreground mt-1">Drag & drop a video file or paste URL below</p>
          </div>
        )}
        <div className="mt-3">
          <Label className="text-xs">Or paste YouTube/Vimeo URL</Label>
          <Input
            value={videoUrl}
            onChange={(e) => onVideoChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            className="mt-1"
          />
        </div>
      </div>

      {/* 360° Tour Section */}
      <div>
        <h4 className="text-sm font-medium mb-3">360° Virtual Tour</h4>
        {virtualTourUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-6 h-6" />
                <span className="text-sm">Tour URL: {virtualTourUrl.substring(0, 50)}...</span>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onVirtualTourChange("")}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <Globe className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No virtual tour added</p>
          </div>
        )}
        <div className="mt-3">
          <Label className="text-xs">Paste Matterport, Kuula, or other 360° tour URL</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={tourUrlInput}
              onChange={(e) => setTourUrlInput(e.target.value)}
              placeholder="https://my.matterport.com/show/?m=..."
            />
            <Button 
              type="button"
              onClick={handleTourUrlSave}
              variant="outline"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
