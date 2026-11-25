"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminChartsProps {
  bookingsByStatus: Array<{ status: string; count: number }>;
  servicesByCategory: Array<{
    category: string;
    services: number;
    bookings: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  requested: "#f59e0b",
  accepted: "#3b82f6",
  "in-progress": "#14b8a6",
  completed: "#10b981",
  rejected: "#ef4444",
  cancelled: "#64748b",
};

export function AdminCharts({
  bookingsByStatus,
  servicesByCategory,
}: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Bookings by Status</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bookingsByStatus}
              margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="status"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="count" name="Bookings" radius={[6, 6, 0, 0]}>
                {bookingsByStatus.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] || "var(--chart-1)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services &amp; Demand by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={servicesByCategory}
              margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={48}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="services"
                name="Services"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="bookings"
                name="Bookings"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
