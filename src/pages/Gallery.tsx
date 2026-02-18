import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageCard } from "@/components/dashboard/PageCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import imageCompression from "browser-image-compression"; // 1. Import the library

// API Configuration
const API_BASE_URL = "https://api.clickplick.co.uk";

interface GalleryImage {
  id: number;
  image_url: string;
  type: string;
  created_at: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(""); // To show "Compressing..." vs "Uploading..."
  const [newCategory, setNewCategory] = useState("Weddings");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- 1. FETCH IMAGES ---
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/gallery`);
      if (!response.ok) throw new Error("Failed to fetch gallery");
      
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // --- 2. ADD IMAGE (WITH COMPRESSION) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddImage = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    setUploadStatus("Compressing..."); // Feedback to user

    try {
      // --- COMPRESSION LOGIC STARTS HERE ---
      const options = {
        maxSizeMB: 0.5,          // Target: Under 500KB
        maxWidthOrHeight: 1920,  // Resize huge images to 1920px (HD)
        useWebWorker: true,      // Run in background to avoid freezing UI
        fileType: "image/webp",  // Force conversion to WebP
        initialQuality: 0.8,     // Start at 80% quality
      };

      // Compress the file
      const compressedFile = await imageCompression(selectedFile, options);
      
      // If we need to rename the file to have .webp extension
      const newFileName = selectedFile.name.replace(/\.[^/.]+$/, "") + ".webp";
      const finalFile = new File([compressedFile], newFileName, { type: "image/webp" });

      console.log(`Original: ${selectedFile.size / 1024}KB, Compressed: ${finalFile.size / 1024}KB`);
      // --- COMPRESSION LOGIC ENDS HERE ---

      setUploadStatus("Uploading...");

      const formData = new FormData();
      formData.append("image", finalFile); // Send the COMPRESSED file
      formData.append("category", newCategory);

      const response = await fetch(`${API_BASE_URL}/api/gallery`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      toast.success("Image uploaded successfully");
      setAddModalOpen(false);
      setSelectedFile(null);
      fetchImages();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      setUploadStatus("");
    }
  };

  // --- 3. DELETE IMAGE ---
  const handleDelete = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery/${imageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setImages(images.filter((img) => img.id !== imageId));
        toast.success("Image deleted");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  };

  return (
    <AdminLayout title="Gallery Management" subtitle="Manage your portfolio images">
      <PageCard
        action={
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Image</DialogTitle>
                <DialogDescription>
                  Uploads will be automatically optimized (WebP, &lt;500KB)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newCategory}
                    onValueChange={setNewCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weddings">Weddings</SelectItem>
                      <SelectItem value="Parties">Parties</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Booths">Booths</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Image File</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddImage} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadStatus}
                    </>
                  ) : (
                    "Upload Image"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
            <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
            <p>No images found</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-lg border bg-card shadow-card transition-all hover:shadow-card-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                  <img
                    src={getImageUrl(image.image_url)}
                    alt={image.type}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
                    }}
                  />
                  {/* Overlay for Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(image.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-medium">
                      {image.type || "General"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(image.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </AdminLayout>
  );
};

export default Gallery;