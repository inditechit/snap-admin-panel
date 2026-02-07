import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { eventTypesData } from "@/data/mockData";

const EventTypes = () => {
  const [eventTypes, setEventTypes] = useState(eventTypesData);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof eventTypesData[0] | null>(null);

  const handleDelete = (eventId: string) => {
    setEventTypes(eventTypes.filter(event => event.id !== eventId));
  };

  const handleEdit = (event: typeof eventTypesData[0]) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  return (
    <AdminLayout title="Event Types" subtitle="Manage event categories for your website">
      <PageCard
        action={
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Event Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Event Type</DialogTitle>
                <DialogDescription>Create a new event category</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Input placeholder="Event type name" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Brief description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input placeholder="https://..." />
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
                <Button onClick={() => setAddModalOpen(false)}>Create Event Type</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((event) => (
            <div
              key={event.id}
              className="group overflow-hidden rounded-lg border bg-card shadow-card transition-all hover:shadow-card-md"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={event.image}
                  alt={event.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{event.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
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
            <DialogTitle>Edit Event Type</DialogTitle>
            <DialogDescription>Update event category details</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Event Name</Label>
                <Input defaultValue={selectedEvent.name} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={selectedEvent.description} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input defaultValue={selectedEvent.image} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={selectedEvent.status}>
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

export default EventTypes;
