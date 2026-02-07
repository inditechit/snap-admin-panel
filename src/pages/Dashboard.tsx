import { Users, UserPlus, Calendar, Image } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageCard } from "@/components/dashboard/PageCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  monthlyLeadsData,
  eventTypeDistribution,
  topServicesData,
} from "@/data/mockData";

const Dashboard = () => {
  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back! Here's your business overview.">
      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value="1,284"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 12.5, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="New This Week"
          value="48"
          icon={<UserPlus className="h-6 w-6" />}
          trend={{ value: 8.2, isPositive: true }}
          variant="accent"
        />
        <StatCard
          title="Events Booked"
          value="156"
          icon={<Calendar className="h-6 w-6" />}
          trend={{ value: 5.1, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Gallery Images"
          value="2,847"
          icon={<Image className="h-6 w-6" />}
          trend={{ value: 3.2, isPositive: false }}
          variant="info"
        />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Leads per Month */}
        <PageCard title="Leads per Month" description="Lead generation trend over the year">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyLeadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        {/* Event Type Distribution */}
        <PageCard title="Event Type Distribution" description="Breakdown by event category">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {eventTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      {/* Top Services Chart */}
      <div className="mt-6">
        <PageCard title="Top Services" description="Most booked photobooth services">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServicesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  dataKey="service"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
