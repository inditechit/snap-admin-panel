import { useEffect, useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageCard } from "@/components/dashboard/PageCard";
import { Loader2, TrendingUp, Users, CheckCircle, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { authFetch } from "@/lib/api";

// --- Types ---
interface Lead {
  id: number;
  status: string; // "New" | "Contacted" | "Converted" | "Closed"
  created_at: string;
  event_date: string;
  customer_name: string;
  event_type?: string;
  choice_of_photobooth?: string;
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Analytics = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState("last30");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // --- 1. Fetch Real Data ---
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await authFetch("https://api.clickplick.co.uk/api/leads/leads");
        const result = await response.json();
        if (result.success) {
          setLeads(result.data);
        }
      } catch (error) {
        console.error("Analytics fetch error:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  useEffect(() => {
    const today = new Date();
    const format = (d: Date) => d.toISOString().slice(0, 10);

    if (datePreset === "all") {
      setDateFrom("");
      setDateTo("");
      return;
    }

    if (datePreset === "last30") {
      const from = new Date(today);
      from.setDate(today.getDate() - 29);
      setDateFrom(format(from));
      setDateTo(format(today));
      return;
    }

    if (datePreset === "last7") {
      const from = new Date(today);
      from.setDate(today.getDate() - 6);
      setDateFrom(format(from));
      setDateTo(format(today));
      return;
    }

    if (datePreset === "thisMonth") {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(format(from));
      setDateTo(format(today));
    }
  }, [datePreset]);

  const filteredLeads = useMemo(() => {
    if (!dateFrom && !dateTo) return leads;
    return leads.filter((lead) => {
      const created = new Date(lead.created_at);
      if (Number.isNaN(created.getTime())) return false;
      if (dateFrom && created < new Date(`${dateFrom}T00:00:00`)) return false;
      if (dateTo && created > new Date(`${dateTo}T23:59:59`)) return false;
      return true;
    });
  }, [leads, dateFrom, dateTo]);

  // --- 2. Process Data for Charts ---

  // A. KPI Cards
  const kpiData = useMemo(() => {
    const total = filteredLeads.length;
    const converted = filteredLeads.filter((l) => l.status === "Converted").length;
    const contacted = filteredLeads.filter((l) => l.status === "Contacted").length;
    const newLeads = filteredLeads.filter((l) => l.status === "New").length;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0";
    const avgPerDay = dateFrom && dateTo
      ? (total / (Math.max(1, (new Date(`${dateTo}T00:00:00`).getTime() - new Date(`${dateFrom}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24) + 1))).toFixed(1)
      : "0";

    return { total, converted, contacted, newLeads, conversionRate, avgPerDay };
  }, [filteredLeads, dateFrom, dateTo]);

  // B. Monthly Leads Trend (Based on created_at)
  const monthlyTrendData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize current year months to 0 so chart looks complete
    monthOrder.forEach(m => months[m] = 0);

    filteredLeads.forEach((lead) => {
      const date = new Date(lead.created_at);
      const monthName = date.toLocaleString("default", { month: "short" });
      months[monthName] = (months[monthName] || 0) + 1;
    });

    return monthOrder.map((month) => ({
      month,
      leads: months[month],
    }));
  }, [filteredLeads]);

  // C. Status Distribution (Pie Chart)
  const statusData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredLeads.forEach((lead) => {
      const status = lead.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  }, [filteredLeads]);

  // D. Event Seasonality (Based on event_date)
  const eventSeasonalityData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    filteredLeads.forEach((lead) => {
      if (lead.event_date) {
        const date = new Date(lead.event_date);
        const monthName = date.toLocaleString("default", { month: "short" });
        months[monthName] = (months[monthName] || 0) + 1;
      }
    });

    return monthOrder.map((month) => ({
      name: month,
      events: months[month] || 0,
    }));
  }, [filteredLeads]);

  const topEventTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLeads.forEach((lead) => {
      const key = lead.event_type || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredLeads]);

  if (loading) {
    return (
      <AdminLayout title="Analytics" subtitle="Loading data...">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics" subtitle="Real-time business performance">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={datePreset}
          onChange={(e) => setDatePreset(e.target.value)}
        >
          <option value="last30">Last 30 Days</option>
          <option value="last7">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="all">All Time</option>
          <option value="custom">Custom</option>
        </select>
        <input
          type="date"
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={dateFrom}
          onChange={(e) => {
            setDatePreset("custom");
            setDateFrom(e.target.value);
          }}
        />
        <input
          type="date"
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={dateTo}
          onChange={(e) => {
            setDatePreset("custom");
            setDateTo(e.target.value);
          }}
        />
      </div>
      
      {/* 1. KPI Stats Row */}
      <div className="grid gap-4 md:grid-cols-6 mb-6">
        <PageCard className="text-center py-6">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Total Leads</p>
          <p className="mt-1 text-3xl font-bold">{kpiData.total}</p>
        </PageCard>

        <PageCard className="text-center py-6">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
          <p className="mt-1 text-3xl font-bold">{kpiData.conversionRate}%</p>
        </PageCard>

        <PageCard className="text-center py-6">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Converted Deals</p>
          <p className="mt-1 text-3xl font-bold">{kpiData.converted}</p>
        </PageCard>

        <PageCard className="text-center py-6">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-orange-100 rounded-full text-orange-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">New Opportunities</p>
          <p className="mt-1 text-3xl font-bold">{kpiData.newLeads}</p>
        </PageCard>
        <PageCard className="text-center py-6">
          <p className="text-sm text-muted-foreground">Contacted</p>
          <p className="mt-1 text-3xl font-bold">{kpiData.contacted}</p>
        </PageCard>
        <PageCard className="text-center py-6">
          <p className="text-sm text-muted-foreground">Avg Leads / Day</p>
          <p className="mt-1 text-3xl font-bold">{kpiData.avgPerDay}</p>
        </PageCard>
      </div>

      {/* 2. Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Monthly Lead Generation Trend */}
        <PageCard title="Lead Growth Trend" description="Inquiries received per month">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        {/* Lead Status Distribution */}
        <PageCard title="Lead Status Distribution" description="Current pipeline state">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      {/* 3. Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PageCard title="Event Seasonality" description="When events are actually scheduled to happen">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventSeasonalityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="events" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40}>
                   {eventSeasonalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
        <PageCard title="Top Event Types" description="Most requested event categories">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEventTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

    </AdminLayout>
  );
};

export default Analytics;