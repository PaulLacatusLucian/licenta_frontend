import React, { useState, useEffect } from 'react';
import axios from "../axiosConfig";
import { 
  FaChartBar, 
  FaUtensils, 
  FaUsers, 
  FaMoneyBillWave, 
  FaExclamationTriangle,
  FaCalendarAlt
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CafeteriaStats = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [popularItems, setPopularItems] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [dailySales, setDailySales] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [allergenStats, setAllergenStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [
          popularItemsRes, 
          revenueRes, 
          dailySalesRes, 
          topStudentsRes, 
          inventoryRes,
          allergensRes
        ] = await Promise.all([
          axios.get(`/menu/stats/popular?limit=5`),
          axios.get(`/menu/stats/revenue?month=${currentMonth}&year=${currentYear}`),
          axios.get(`/menu/stats/daily-sales?month=${currentMonth}&year=${currentYear}`),
          axios.get(`/menu/stats/top-students?limit=5`),
          axios.get(`/menu/stats/inventory`),
          axios.get(`/menu/stats/allergens`)
        ]);
        
        setPopularItems(popularItemsRes.data);
        setRevenue(revenueRes.data);
        setDailySales(dailySalesRes.data);
        setTopStudents(topStudentsRes.data);
        setInventory(inventoryRes.data);
        
        const allergenData = Object.entries(allergensRes.data).map(([name, value]) => ({
          name,
          value
        }));
        setAllergenStats(allergenData);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load statistics. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, [currentMonth, currentYear]);
  
  const handleMonthChange = (e) => {
    setCurrentMonth(Number(e.target.value));
  };
  
  const handleYearChange = (e) => {
    setCurrentYear(Number(e.target.value));
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-dark2 font-medium">Loading statistics...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md max-w-lg">
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button
            className="mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FaChartBar className="mr-3 text-primary" /> Cafeteria Statistics
        </h1>
        
        {/* Time period selector */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center">
              <FaCalendarAlt className="text-primary mr-2" />
              <span className="font-medium">Time Period:</span>
            </div>
            <div className="flex flex-wrap space-x-2">
              <select 
                value={currentMonth}
                onChange={handleMonthChange}
                className="border rounded p-2"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select 
                value={currentYear}
                onChange={handleYearChange}
                className="border rounded p-2"
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <FaMoneyBillWave className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">${revenue.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <FaUtensils className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">
                {dailySales.reduce((sum, day) => sum + day.total, 0)}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold">
                {inventory.filter(item => item.status === "Low Stock").length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Popular Items Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaUtensils className="text-primary mr-2" /> Most Popular Items
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={popularItems}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Order Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Daily Sales Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaMoneyBillWave className="text-primary mr-2" /> Daily Sales
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySales}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => ['$' + value.toFixed(2), 'Sales']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#82ca9d" 
                    name="Daily Sales" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Top Students Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaUsers className="text-primary mr-2" /> Top Students by Orders
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topStudents}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orderCount" fill="#8884d8" name="Order Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Allergen Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaExclamationTriangle className="text-primary mr-2" /> Allergen Distribution
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allergenStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allergenStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Inventory Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaUtensils className="text-primary mr-2" /> Inventory Status
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Item Name</th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Quantity Left</th>
                  <th className="py-2 px-4 border-b text-left text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-4 border-b">{item.name}</td>
                    <td className="py-2 px-4 border-b">{item.quantity}</td>
                    <td className="py-2 px-4 border-b">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "In Stock" 
                            ? "bg-green-100 text-green-800" 
                            : item.status === "Low Stock" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeteriaStats;