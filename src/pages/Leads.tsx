import { useEffect, useState } from "react";
import { 
  Eye, 
  MoreHorizontal, 
  Trash2, 
  Loader2, 
  Copy, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Calendar,
  User,
  MapPin,
  Clock,
  Mail,
  Phone
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

// --- INTERFACES ---
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

  // --- 4. COPY LOGIC ---
  const handleCopyIndividual = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

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

  // --- MODAL ROW COMPONENT (STRICT 2-COLUMN) ---
  const DetailRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
    <div className="group flex flex-col justify-center rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50">
      <div className="flex items-center gap-1 mb-1">
        {Icon && <Icon className="h-2.5 w-2.5 text-muted-foreground shrink-0" />}
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </p>
      </div>
      <div className="flex items-center justify-between w-full gap-1">
        <p className="text-[11px] sm:text-sm font-medium leading-tight truncate">
          {value || 'N/A'}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-100 transition-opacity"
          onClick={() => handleCopyIndividual(value, label)}
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
                    <TableHead className="min-w-[120px]">Customer</TableHead>
                    <TableHead className="min-w-[150px]">Contact</TableHead>
                    <TableHead className="min-w-[100px]">Event Type</TableHead>
                    <TableHead className="min-w-[120px]">Booth Choice</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="min-w-[130px]">Status</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
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
                        <TableCell className="font-medium truncate max-w-[120px]">{lead.customer_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-[11px]">
                            <span className="truncate max-w-[150px]">{lead.email}</span>
                            <span className="text-muted-foreground">{lead.phone_number}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-xs">{lead.event_type || '-'}</TableCell>
                        <TableCell className="text-xs">{lead.choice_of_photobooth || '-'}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{formatDate(lead.event_date)}</TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => handleStatusChange(lead.id, value)}
                          >
                            <SelectTrigger className="w-28 h-8">
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
                              <DropdownMenuItem 
                                onClick={() => { setSelectedLead(lead); setViewModalOpen(true); }} 
                                className="cursor-pointer"
                              >
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t text-sm text-muted-foreground">
                <div className="italic">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, leads.length)} of {leads.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <span className="px-2 font-medium text-foreground">Page {currentPage} of {totalPages}</span>
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
            </>
          )}
        </div>
      </PageCard>

      {/* --- STRICT 2-COLUMN RESPONSIVE MODAL --- */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-h-[95vh] w-[95vw] overflow-hidden p-0 sm:max-w-lg">
          <div className="flex h-full flex-col">
            <DialogHeader className="p-4 pb-2 border-b">
              <DialogTitle className="text-lg">Inquiry Overview</DialogTitle>
              <DialogDescription className="text-[10px]">Detailed breakdown of the customer request.</DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                    
                    {/* Customer Section */}
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Customer</p>
                    </div>
                    <DetailRow icon={User} label="Name" value={selectedLead.customer_name} />
                    <DetailRow icon={Phone} label="Phone" value={selectedLead.phone_number} />
                    <div className="col-span-2">
                       <DetailRow icon={Mail} label="Email Address" value={selectedLead.email} />
                    </div>
                    
                    {/* Event Section */}
                    <div className="col-span-2 mt-2">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest border-l-2 border-primary pl-2">The Event</p>
                    </div>
                    <DetailRow label="Type" value={selectedLead.event_type} />
                    <DetailRow label="Booth" value={selectedLead.choice_of_photobooth} />
                    <DetailRow label="Guests" value={selectedLead.no_of_guests} />
                    <DetailRow icon={MapPin} label="Postcode" value={selectedLead.event_postcode} />
                    
                    {/* Timing Section */}
                    <div className="col-span-2 mt-2">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Timing</p>
                    </div>
                    <DetailRow icon={Calendar} label="Date" value={formatDate(selectedLead.event_date)} />
                    <DetailRow icon={Clock} label="Start Time" value={selectedLead.event_time} />
                    
                    {/* Status Banner */}
                    <div className="col-span-2 mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3 border">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Current Status</p>
                      <StatusBadge status={selectedLead.status} />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 border-t bg-background p-4 flex flex-col gap-2">
                  <Button onClick={handleCopyAllDetails} className="w-full gap-2 text-xs font-semibold h-10" variant="default">
                    <Copy className="h-3.5 w-3.5" /> Copy Full Summary
                  </Button>
                  <Button onClick={() => setViewModalOpen(false)} variant="ghost" className="text-xs h-8">
                    Close Details
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Leads;