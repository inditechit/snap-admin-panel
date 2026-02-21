import { useEffect, useState } from "react";
import { 
  Eye, 
  MoreHorizontal, 
  Trash2, 
  Loader2, 
  Copy, 
  ChevronLeft, 
  ChevronRight,
  Check
} from "lucide-react";
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

// Updated Interface with new fields
interface Lead {
  id: number;
  customer_name: string;
  email: string;
  phone_number: string;
  event_date: string;
  event_time: string;
  event_postcode: string;
  no_of_guests: string;
  choice_of_photobooth: string;
  event_type: string;
  status: string;
  created_at: string;
}

const statusOptions = ["New", "Contacted", "Converted", "Closed"];

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // --- 1. FETCH LEADS FROM API ---
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.clickplick.co.uk/api/leads/leads");
      const result = await response.json();

      if (result.success) {
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
    const originalLeads = [...leads];
    const updatedLeads = leads.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);

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
      setLeads(originalLeads);
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
        
        if (currentLeads.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
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

  // --- 4. COPY ALL DETAILS ---
  const handleCopyAllDetails = () => {
    if (!selectedLead) return;

    const detailsText = `
Lead Details:
-------------
Name: ${selectedLead.customer_name}
Email: ${selectedLead.email}
Phone: ${selectedLead.phone_number}
Event Type: ${selectedLead.event_type || 'N/A'}
Photobooth: ${selectedLead.choice_of_photobooth || 'N/A'}
Guests: ${selectedLead.no_of_guests || 'N/A'}
Event Date: ${formatDate(selectedLead.event_date)}
Event Time: ${selectedLead.event_time}
Postcode: ${selectedLead.event_postcode}
Status: ${selectedLead.status}
    `.trim();

    navigator.clipboard.writeText(detailsText);
    toast.success("All lead details copied to clipboard!");
  };

  // --- 5. COPY INDIVIDUAL DETAIL ---
  const handleCopyIndividual = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    
    // Reset copy icon checkmark after 2 seconds
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = leads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // --- HELPER COMPONENT FOR MODAL ROWS ---
  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="col-span-2 sm:col-span-1 group relative flex flex-col justify-center rounded-md p-2 hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center justify-between w-full">
        <p className="font-medium text-sm break-words pr-2">{value || 'N/A'}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={() => handleCopyIndividual(value, label)}
          title={`Copy ${label}`}
        >
          {copiedField === label ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Leads Management" subtitle="Track and manage all your business inquiries">
      <PageCard>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Booth Choice</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No leads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.customer_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>{lead.email}</span>
                            <span className="text-muted-foreground text-xs">{lead.phone_number}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{lead.event_type || '-'}</TableCell>
                        <TableCell>{lead.choice_of_photobooth || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>{formatDate(lead.event_date)}</span>
                            <span className="text-muted-foreground text-xs">{lead.event_time}</span>
                          </div>
                        </TableCell>
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
                              <DropdownMenuItem onClick={() => handleView(lead)} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(lead.id)}
                                className="text-destructive cursor-pointer"
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

              {/* PAGINATION CONTROLS */}
              {leads.length > 0 && (
                <div className="flex items-center justify-end space-x-2 py-4 px-2">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, leads.length)} of {leads.length} entries
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PageCard>

      {/* View Lead Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>Hover over any detail to copy it individually.</DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-1">
                
                {/* Standard Details */}
                <DetailRow label="Name" value={selectedLead.customer_name} />
                <DetailRow label="Email" value={selectedLead.email} />
                <DetailRow label="Phone" value={selectedLead.phone_number} />
                
                {/* New Event Details */}
                <DetailRow label="Event Type" value={selectedLead.event_type} />
                <DetailRow label="Booth Choice" value={selectedLead.choice_of_photobooth} />
                <DetailRow label="No. of Guests" value={selectedLead.no_of_guests?.toString()} />
                
                {/* Logistics */}
                <DetailRow label="Event Date" value={formatDate(selectedLead.event_date)} />
                <DetailRow label="Event Time" value={selectedLead.event_time} />
                <DetailRow label="Postcode" value={selectedLead.event_postcode} />
                
                {/* System / Status */}
                <div className="col-span-2 sm:col-span-1 p-2 flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                  <div><StatusBadge status={selectedLead.status} /></div>
                </div>
                
                <DetailRow 
                  label="Submission Date" 
                  value={new Date(selectedLead.created_at).toLocaleString()} 
                />
              </div>

              {/* Copy All Button */}
              <div className="border-t pt-4 mt-2">
                <Button
                  onClick={handleCopyAllDetails}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                  Copy All Details to Clipboard
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Leads;