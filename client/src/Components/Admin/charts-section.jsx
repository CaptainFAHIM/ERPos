import React, { useState, useEffect } from "react";
import { Card, Spinner, Select } from "flowbite-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { FaChartLine, FaChartPie, FaChartBar } from "react-icons/fa";
import { MdError } from "react-icons/md";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
        <p className="font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PremiumChartsSection() {
  const [salesProfitData, setSalesProfitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("currentMonth");
  const [categoryData, setCategoryData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  useEffect(() => {
    const fetchSalesProfitData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/sales-profit");
        if (!response.ok) throw new Error("Failed to fetch sales and profit data");
        const data = await response.json();
        setSalesProfitData(data);
      } catch (error) {
        console.error("Error fetching sales and profit data:", error);
        setError("Failed to fetch sales and profit data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesProfitData();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await fetch("http://localhost:4000/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const categories = await response.json();

        const categoryWithProductCounts = await Promise.all(
          categories.map(async (category) => {
            const categoryResponse = await fetch(
              `http://localhost:4000/api/productscategory/${category.categoryName}`
            );
            if (!categoryResponse.ok) throw new Error("Failed to fetch product count for category");
            const productData = await categoryResponse.json();
            return {
              name: category.categoryName,
              value: productData.productCount,
            };
          })
        );

        setCategoryData(categoryWithProductCounts);
      } catch (error) {
        console.error("Error fetching category data:", error);
        setCategoryError("Failed to fetch category data. Please try again later.");
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const formatChartData = (data, period) => {
    if (!data || !data[period]) return [];
    return [
      {
        name: period,
        sales: data[period].totalSales,
        profit: data[period].totalProfit,
      },
    ];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="col-span-1 lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaChartLine className="mr-2" /> Sales & Profit Trends
          </h5>
          <Select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="currentMonth">Current Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="last6Months">Last 6 Months</option>
            <option value="last1Year">Last Year</option>
            <option value="last3Years">Last 3 Years</option>
            <option value="allTime">All Time</option>
          </Select>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <div className="text-red-500 flex items-center justify-center h-[350px]">
            <MdError className="mr-2" /> {error}
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatChartData(salesProfitData, selectedPeriod)}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#36A2EB" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#36A2EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6384" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF6384" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="sales" stroke="#36A2EB" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#FF6384" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h5 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaChartPie className="mr-2" /> Category Distribution
        </h5>
        {categoryLoading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Spinner size="xl" />
          </div>
        ) : categoryError ? (
          <div className="text-red-500 flex items-center justify-center h-[350px]">
            <MdError className="mr-2" /> {categoryError}
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h5 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaChartBar className="mr-2" /> Category Comparison
        </h5>
        {categoryLoading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Spinner size="xl" />
          </div>
        ) : categoryError ? (
          <div className="text-red-500 flex items-center justify-center h-[350px]">
            <MdError className="mr-2" /> {categoryError}
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
