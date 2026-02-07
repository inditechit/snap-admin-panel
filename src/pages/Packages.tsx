import { useState } from "react";
import { Plus, Edit, Check, Star } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageCard } from "@/components/dashboard/PageCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { packagesData } from "@/data/mockData";

const Packages = () => {
  const [packages, setPackages] = useState(packagesData);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof packagesData[0] | null>(null);

  const handleEdit = (pkg: typeof packagesData[0]) => {
    setSelectedPackage(pkg);
    setEditModalOpen(true);
  };

  const toggleEnabled = (packageId: string) => {
    // In a real app, this would toggle the package active state
    console.log("Toggle package:", packageId);
  };

  return (
    <AdminLayout title="Photobooth Packages" subtitle="Manage your pricing packages">
      <PageCard
        action={
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Package</DialogTitle>
                <DialogDescription>Add a new photobooth package</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Package Name</Label>
                  <Input placeholder="Package name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (£)</Label>
                    <Input type="number" placeholder="299" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input placeholder="2 hours" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea placeholder="Unlimited photos&#10;Instant prints&#10;Online gallery" rows={5} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="popular" />
                  <Label htmlFor="popular">Mark as Popular</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setAddModalOpen(false)}>Create Package</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-card-md ${
                pkg.popular ? "ring-2 ring-accent" : ""
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                  <Star className="mr-1 h-3 w-3" />
                  Most Popular
                </Badge>
              )}
              <div className="text-center">
                <h3 className="text-xl font-semibold">{pkg.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£{pkg.price}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{pkg.duration}</p>
              </div>
              <ul className="mt-6 space-y-3">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(pkg)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Switch
                  defaultChecked
                  onCheckedChange={() => toggleEnabled(pkg.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </PageCard>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>Update package details</DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input defaultValue={selectedPackage.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (£)</Label>
                  <Input type="number" defaultValue={selectedPackage.price} />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input defaultValue={selectedPackage.duration} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <Textarea defaultValue={selectedPackage.features.join("\n")} rows={5} />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="popular-edit" defaultChecked={selectedPackage.popular} />
                <Label htmlFor="popular-edit">Mark as Popular</Label>
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

export default Packages;
