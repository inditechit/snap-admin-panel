import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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
import { galleryData } from "@/data/mockData";

const Gallery = () => {
  const [images, setImages] = useState(galleryData);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<typeof galleryData[0] | null>(null);
  const [newImage, setNewImage] = useState({ title: "", category: "Wedding", image: "" });

  const toggleVisibility = (imageId: string) => {
    setImages(images.map(img =>
      img.id === imageId ? { ...img, visible: !img.visible } : img
    ));
  };

  const handleDelete = (imageId: string) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleEdit = (image: typeof galleryData[0]) => {
    setSelectedImage(image);
    setEditModalOpen(true);
  };

  const handleAddImage = () => {
    if (newImage.title && newImage.image) {
      setImages([
        ...images,
        {
          id: String(Date.now()),
          ...newImage,
          visible: true,
        },
      ]);
      setNewImage({ title: "", category: "Wedding", image: "" });
      setAddModalOpen(false);
    }
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
                <DialogDescription>Upload a new image to your gallery</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newImage.title}
                    onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                    placeholder="Image title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newImage.category}
                    onValueChange={(value) => setNewImage({ ...newImage, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Birthday">Birthday</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={newImage.image}
                    onChange={(e) => setNewImage({ ...newImage, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddImage}>Add Image</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg border bg-card shadow-card transition-all hover:shadow-card-md"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image.image}
                  alt={image.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{image.title}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {image.category}
                    </Badge>
                  </div>
                  <Badge variant={image.visible ? "default" : "outline"}>
                    {image.visible ? "Visible" : "Hidden"}
                  </Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleVisibility(image.id)}
                  >
                    {image.visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(image)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(image.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageCard>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update image details</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input defaultValue={selectedImage.title} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={selectedImage.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Birthday">Birthday</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setEditModalOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Gallery;
