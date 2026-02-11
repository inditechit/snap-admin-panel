import { useEffect, useState } from "react";
import { Eye, MoreHorizontal, Trash2, Loader2, Copy } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageCard } from "@/components/dashboard/PageCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Define the type matching your DB structure
interface Lead {
  id: number;
  customer_name: string;
  email: string;
  phone_number: string;
  event_date: string;
  event_time: string;
  event_postcode: string;
  status: string;
  created_at: string;
}

const statusOptions = ["New", "Contacted", "Converted", "Closed"];

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // --- 1. FETCH LEADS FROM API ---
  const fetchLeads = async () => {
    try {
      setLoading(true);
      // Ensure this URL matches your backend port (default 5000)
      const response = await fetch("https://api.clickplick.co.uk/api/leads/leads");
      const result = await response.json();

      if (result.success) {
        // Map any null statuses to "New" just in case
        const mappedData = result.data.map((lead: any) => ({
          ...lead,
          status: lead.status || "New"
        }));
        setLeads(mappedData);
      } else {
        toast.error("Failed to load leads data");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // --- 2. UPDATE STATUS API ---
  const handleStatusChange = async (leadId: number, newStatus: string) => {
    // Optimistic UI Update
    const originalLeads = [...leads];
    setLeads(leads.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));

    try {
      const response = await fetch(`https://api.clickplick.co.uk/api/leads/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(`Status updated to ${newStatus}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update status");
      setLeads(originalLeads); // Revert on error
    }
  };

  // --- 3. DELETE LEAD API ---
  const handleDelete = async (leadId: number) => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;

    try {
      const response = await fetch(`https://api.clickplick.co.uk/api/leads/leads/${leadId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        setLeads(leads.filter(lead => lead.id !== leadId));
        toast.success("Lead deleted successfully");
      } else {
        toast.error("Failed to delete lead");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting lead");
    }
  };

  const handleView = (lead: Lead) => {
    setSelectedLead(lead);
    setViewModalOpen(true);
  };

  // --- 4. COPY LEAD DETAILS ---
  const handleCopyDetails = () => {
    if (!selectedLead) return;

    const detailsText = `
Lead Details:
-------------
Name: ${selectedLead.customer_name}
Email: ${selectedLead.email}
Phone: ${selectedLead.phone_number}
Status: ${selectedLead.status}
Event Date: ${formatDate(selectedLead.event_date)}
Event Time: ${selectedLead.event_time}
Postcode: ${selectedLead.event_postcode}
    `.trim();

    navigator.clipboard.writeText(detailsText);
    toast.success("Lead details copied to clipboard!");
  };

  // Helper to format dates nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminLayout title="Leads Management" subtitle="Track and manage all your business inquiries">
      <PageCard>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No leads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.customer_name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone_number}</TableCell>
                      <TableCell>{formatDate(lead.event_date)}</TableCell>
                      <TableCell>{lead.event_time}</TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue>
                              <StatusBadge status={lead.status} />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                <StatusBadge status={status} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(lead)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(lead.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </PageCard>

      {/* View Lead Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Complete information for this inquiry</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedLead.customer_name}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Status</p>
                  <StatusBadge status={selectedLead.status} />
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Email</p>
                  <p>{selectedLead.email}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Phone</p>
                  <p>{selectedLead.phone_number}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Postcode</p>
                  <p>{selectedLead.event_postcode}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Event Date</p>
                  <p>{formatDate(selectedLead.event_date)}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Event Time</p>
                  <p>{selectedLead.event_time}</p>
                </div>
                <div className="col-span-2 border-t pt-2 mt-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Submission Date</p>
                  <p className="text-sm">{new Date(selectedLead.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Copy Button Section */}
              <Button 
                onClick={handleCopyDetails} 
                className="w-full mt-4 gap-2"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
                Copy Lead Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Leads;