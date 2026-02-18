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

// --- Types ---
interface Lead {
  id: number;
  status: string; // "New" | "Contacted" | "Converted" | "Closed"
  created_at: string;
  event_date: string;
  customer_name: string;
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Analytics = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Real Data ---
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("https://api.clickplick.co.uk/api/leads/leads");
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

  // --- 2. Process Data for Charts ---

  // A. KPI Cards
  const kpiData = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter((l) => l.status === "Converted").length;
    const newLeads = leads.filter((l) => l.status === "New").length;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0";

    return { total, converted, newLeads, conversionRate };
  }, [leads]);

  // B. Monthly Leads Trend (Based on created_at)
  const monthlyTrendData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize current year months to 0 so chart looks complete
    monthOrder.forEach(m => months[m] = 0);

    leads.forEach((lead) => {
      const date = new Date(lead.created_at);
      const monthName = date.toLocaleString("default", { month: "short" });
      months[monthName] = (months[monthName] || 0) + 1;
    });

    return monthOrder.map((month) => ({
      month,
      leads: months[month],
    }));
  }, [leads]);

  // C. Status Distribution (Pie Chart)
  const statusData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    leads.forEach((lead) => {
      const status = lead.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  }, [leads]);

  // D. Event Seasonality (Based on event_date)
  const eventSeasonalityData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    leads.forEach((lead) => {
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
  }, [leads]);

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
      
      {/* 1. KPI Stats Row */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
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
      {/* <div className="grid gap-6 lg:grid-cols-1">
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
      </div> */}

    </AdminLayout>
  );
};

export default Analytics;