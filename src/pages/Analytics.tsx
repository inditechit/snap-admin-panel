import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageCard } from "@/components/dashboard/PageCard";
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
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  monthlyLeadsData,
  eventTypeDistribution,
  conversionFunnelData,
  topServicesData,
} from "@/data/mockData";

const Analytics = () => {
  return (
    <AdminLayout title="Analytics" subtitle="Business performance insights">
      {/* Top Row Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Leads Trend */}
        <PageCard title="Monthly Leads" description="Lead generation over the past year">
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
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        {/* Conversion Funnel */}
        <PageCard title="Conversion Funnel" description="Lead to customer journey">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionFunnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  dataKey="stage"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {conversionFunnelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--chart-${index + 1}))`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      {/* Bottom Row Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Popular Event Types */}
        <PageCard title="Popular Event Types" description="Distribution by event category">
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
            <div className="flex flex-wrap justify-center gap-4 -mt-4">
              {eventTypeDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </PageCard>

        {/* Service Demand */}
        <PageCard title="Service Demand" description="Most requested services">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServicesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="service"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="bookings" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <PageCard className="text-center">
          <p className="text-sm text-muted-foreground">Total Leads (YTD)</p>
          <p className="mt-2 text-3xl font-bold">953</p>
          <p className="text-sm text-success">↑ 23% vs last year</p>
        </PageCard>
        <PageCard className="text-center">
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
          <p className="mt-2 text-3xl font-bold">37.6%</p>
          <p className="text-sm text-success">↑ 5.2% vs last year</p>
        </PageCard>
        <PageCard className="text-center">
          <p className="text-sm text-muted-foreground">Avg. Booking Value</p>
          <p className="mt-2 text-3xl font-bold">£487</p>
          <p className="text-sm text-success">↑ 12% vs last year</p>
        </PageCard>
        <PageCard className="text-center">
          <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
          <p className="mt-2 text-3xl font-bold">4.9/5</p>
          <p className="text-sm text-muted-foreground">Based on 234 reviews</p>
        </PageCard>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
