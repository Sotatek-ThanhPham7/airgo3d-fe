import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Spin,
  Alert,
  Typography,
  Statistic,
  Space,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { panoramaApi, AnalyticsResponse } from "../services/api/panoramaApi";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: {
        startDate?: string;
        endDate?: string;
        period: "day" | "week" | "month";
      } = {
        period,
      };

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].startOf("day").toISOString();
        params.endDate = dateRange[1].endOf("day").toISOString();
      }

      const response = await panoramaApi.getAnalytics(params);

      setAnalytics(response);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch analytics data");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  const handlePeriodChange = (value: "day" | "week" | "month") => {
    setPeriod(value);
  };

  const formatChartDate = (dateString: string): string => {
    switch (period) {
      case "day":
        const date = dayjs(dateString);
        return date.format("MMM DD");
      case "week":
        return dateString;
      case "month":
        return dateString;
      default:
        const defaultDate = dayjs(dateString);
        return defaultDate.format("MMM DD");
    }
  };

  const chartData =
    analytics?.timeSeries.map((point) => ({
      date: formatChartDate(point.date),
      bookmarked: point.bookmarked,
      unbookmarked: point.unbookmarked,
      total: point.total,
    })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-4">
            Panorama Analytics
          </Title>

          {/* Filters */}
          <Card className="mb-6">
            <Space size="large" wrap>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="YYYY-MM-DD"
                  allowClear={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <Select
                  value={period}
                  onChange={handlePeriodChange}
                  style={{ width: 120 }}
                  options={[
                    { label: "Day", value: "day" },
                    { label: "Week", value: "week" },
                    { label: "Month", value: "month" },
                  ]}
                />
              </div>
            </Space>
          </Card>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : analytics ? (
          <>
            {/* Summary Cards */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Total Images"
                    value={analytics.summary.totalImages}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Bookmarked"
                    value={analytics.summary.bookmarkedCount}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Unbookmarked"
                    value={analytics.summary.unbookmarkedCount}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Bookmarked %"
                    value={analytics.summary.bookmarkedPercentage}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Time Series Chart */}
            <Card title="Over Time" className="mb-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={period === "day" ? -45 : 0} // for day, rotate in case of a lot of display days 
                      textAnchor={period === "day" ? "end" : "middle"}
                      height={period === "day" ? 80 : 40}
                      interval={period === "month" ? 0 : "preserveStartEnd"}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="bookmarked"
                      stackId="1"
                      stroke="#52c41a"
                      fill="#52c41a"
                      fillOpacity={0.6}
                      name="Bookmarked"
                    />
                    <Area
                      type="monotone"
                      dataKey="unbookmarked"
                      stackId="1"
                      stroke="#faad14"
                      fill="#faad14"
                      fillOpacity={0.6}
                      name="Unbookmarked"
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#1890ff"
                      strokeWidth={2}
                      name="Total"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No data available for the selected date range
                </div>
              )}
            </Card>
          </>
        ) : (
          <Card>
            <div className="text-center py-10 text-gray-500">
              No analytics data available
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
