import { useState } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PDFUploadProps {
  onUploadComplete: (fileUrl: string, thumbnailUrl: string) => void;
  currentFileUrl?: string;
  currentThumbnailUrl?: string;
  maxSizeMB?: number;
}

export function PDFUpload({
  onUploadComplete,
  currentFileUrl,
  currentThumbnailUrl,
  maxSizeMB = 10,
}: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (!pdfFile) {
      toast.error("Please drop a PDF file");
      return;
    }

    await uploadPDF(pdfFile);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    await uploadPDF(file);
  };

  const uploadPDF = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/upload-pdf-with-thumbnail", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error("Upload failed");

      const { fileUrl, thumbnailUrl } = await response.json();
      onUploadComplete(fileUrl, thumbnailUrl);
      toast.success("PDF uploaded and thumbnail generated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onUploadComplete("", "");
    toast.success("PDF removed");
  };

  if (currentFileUrl) {
    return (
      <div className="flex items-center gap-3">
        {currentThumbnailUrl && (
          <img
            src={currentThumbnailUrl}
            alt="PDF thumbnail"
            className="w-16 h-20 object-cover rounded border"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">PDF Uploaded</span>
          </div>
          <a
            href={currentFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View PDF
          </a>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isUploading}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all
          ${
            isDragging
              ? "border-orange-500 bg-orange-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
              <div className="w-full max-w-xs">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Uploading and generating thumbnail... {uploadProgress}%
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  Drop PDF here or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF up to {maxSizeMB}MB • Thumbnail auto-generated from first
                  page
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
