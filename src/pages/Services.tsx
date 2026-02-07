import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, Camera, Aperture, Play, Video, Maximize2, Film } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageCard } from "@/components/dashboard/PageCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { servicesData } from "@/data/mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  camera: Camera,
  aperture: Aperture,
  play: Play,
  video: Video,
  maximize: Maximize2,
  film: Film,
};

const Services = () => {
  const [services, setServices] = useState(servicesData);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof servicesData[0] | null>(null);

  const handleDelete = (serviceId: string) => {
    setServices(services.filter(service => service.id !== serviceId));
  };

  const handleEdit = (service: typeof servicesData[0]) => {
    setSelectedService(service);
    setEditModalOpen(true);
  };

  const toggleStatus = (serviceId: string) => {
    setServices(services.map(service =>
      service.id === serviceId
        ? { ...service, status: service.status === "Active" ? "Inactive" : "Active" }
        : service
    ));
  };

  return (
    <AdminLayout title="Services Management" subtitle="Manage your photobooth services">
      <PageCard
        action={
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>Create a new photobooth service</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input placeholder="Service name" />
                </div>
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea placeholder="Brief description of the service" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select defaultValue="camera">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camera">Camera</SelectItem>
                      <SelectItem value="aperture">Aperture</SelectItem>
                      <SelectItem value="play">Play</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="maximize">Maximize</SelectItem>
                      <SelectItem value="film">Film</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="Active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setAddModalOpen(false)}>Add Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-3">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon] || Camera;
            return (
              <div
                key={service.id}
                className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-card"
              >
                <button className="cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-5 w-5" />
                </button>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
                <StatusBadge status={service.status} />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Drag and drop to reorder services
        </p>
      </PageCard>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service details</DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input defaultValue={selectedService.name} />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea defaultValue={selectedService.description} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={selectedService.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
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

export default Services;
