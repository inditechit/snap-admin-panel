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
  Clock
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

  // --- 1. FETCH LEADS ---
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

  // --- 2. UPDATE STATUS ---
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
      if (!result.success) throw new Error(result.error);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
      setLeads(originalLeads);
    }
  };

  // --- 3. DELETE LEAD ---
  const handleDelete = async (leadId: number) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      const response = await fetch(`https://api.clickplick.co.uk/api/leads/leads/${leadId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        setLeads(leads.filter(lead => lead.id !== leadId));
        toast.success("Lead deleted");
        if (currentLeads.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1);
      }
    } catch (error) {
      toast.error("Error deleting lead");
    }
  };

  // --- 4. COPY LOGIC ---
  const handleCopyIndividual = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAllDetails = () => {
    if (!selectedLead) return;
    const detailsText = `
Lead Details:
Name: ${selectedLead.customer_name}
Email: ${selectedLead.email}
Phone: ${selectedLead.phone_number}
Event: ${selectedLead.event_type} (${selectedLead.event_date})
Booth: ${selectedLead.choice_of_photobooth}
    `.trim();
    navigator.clipboard.writeText(detailsText);
    toast.success("All details copied!");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = leads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  // --- MODAL HELPER COMPONENT ---
  const DetailRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
    <div className="group flex flex-col justify-center rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50 sm:p-2">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <div className="flex items-center justify-between w-full gap-2">
        <p className="text-sm font-medium leading-tight break-all sm:break-words">
          {value || 'N/A'}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-100 sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={() => handleCopyIndividual(value, label)}
        >
          {copiedField === label ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Leads Management" subtitle="Track and manage all your business inquiries">
      <PageCard>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Booth Choice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLeads.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">No leads found.</TableCell></TableRow>
                  ) : (
                    currentLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.customer_name}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs">{lead.email}</TableCell>
                        <TableCell className="capitalize">{lead.event_type || '-'}</TableCell>
                        <TableCell className="hidden sm:table-cell">{lead.choice_of_photobooth || '-'}</TableCell>
                        <TableCell className="text-sm">{formatDate(lead.event_date)}</TableCell>
                        <TableCell>
                          <Select value={lead.status} onValueChange={(val) => handleStatusChange(lead.id, val)}>
                            <SelectTrigger className="w-28 h-8 sm:w-32"><SelectValue><StatusBadge status={lead.status} /></SelectValue></SelectTrigger>
                            <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}><StatusBadge status={s} /></SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedLead(lead); setViewModalOpen(true); }} className="cursor-pointer"><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-destructive cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* PAGINATION */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t">
                <p className="text-xs text-muted-foreground italic">Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, leads.length)} of {leads.length}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-xs font-medium">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </div>
      </PageCard>

      {/* --- RESPONSIVE MODAL --- */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-hidden p-0 sm:max-w-lg">
          <div className="flex h-full flex-col">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl">Inquiry Details</DialogTitle>
              <DialogDescription>Full lead information and event logistics.</DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-2">
                  <div className="grid grid-cols-1 gap-3 pb-6 sm:grid-cols-2">
                    <div className="col-span-full border-b pb-1 pt-2"><p className="text-xs font-bold text-primary">Customer Information</p></div>
                    <DetailRow icon={User} label="Full Name" value={selectedLead.customer_name} />
                    <DetailRow label="Email Address" value={selectedLead.email} />
                    <DetailRow label="Phone" value={selectedLead.phone_number} />
                    
                    <div className="col-span-full border-b pb-1 pt-4"><p className="text-xs font-bold text-primary">Event Specifics</p></div>
                    <DetailRow label="Event Type" value={selectedLead.event_type} />
                    <DetailRow label="Booth Choice" value={selectedLead.choice_of_photobooth} />
                    <DetailRow label="Guest Count" value={selectedLead.no_of_guests} />
                    
                    <div className="col-span-full border-b pb-1 pt-4"><p className="text-xs font-bold text-primary">Logistics</p></div>
                    <DetailRow icon={Calendar} label="Date" value={formatDate(selectedLead.event_date)} />
                    <DetailRow icon={Clock} label="Time" value={selectedLead.event_time} />
                    <DetailRow icon={MapPin} label="Postcode" value={selectedLead.event_postcode} />
                    
                    <div className="col-span-full mt-4 flex items-center justify-between rounded-lg bg-muted/40 p-3">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Current Status</p>
                      <StatusBadge status={selectedLead.status} />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 border-t bg-background p-4 sm:p-6">
                  <Button onClick={handleCopyAllDetails} className="w-full gap-2" variant="default">
                    <Copy className="h-4 w-4" /> Copy All Details
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