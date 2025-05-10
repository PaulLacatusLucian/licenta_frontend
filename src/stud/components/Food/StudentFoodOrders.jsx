import React, { useState, useEffect } from "react";
import axios from "../../../axiosConfig";
import Cookies from "js-cookie";
import { 
  FaUtensils, 
  FaCalendarAlt, 
  FaArrowLeft
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import StudentNavbar from "../StudentNavbar";

const StudentFoodOrders = () => {
  const [studentOrders, setStudentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("food");
  const [studentData, setStudentData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchStudentData = async () => {
      try {
        const response = await axios.get("/students/me");
        setStudentData(response.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [navigate]);

  useEffect(() => {
    const fetchStudentOrders = async () => {
      try {
        setIsLoading(true);
        
        // Get current month and year
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const year = now.getFullYear();
        
        const response = await axios.get(`/students/me/orders`, {
          params: { month, year }
        });
        
        let ordersData = response.data || [];
        
        // Sort by date (most recent first)
        ordersData = ordersData.sort((a, b) => 
          new Date(b.orderTime) - new Date(a.orderTime)
        );
        
        // Filter to last 3 days and today
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 3);
        
        ordersData = ordersData.filter(order => 
          new Date(order.orderTime) >= cutoffDate
        );
        
        setStudentOrders(ordersData);
        setError(null);
      } catch (error) {
        console.error("Error fetching student orders:", error);
        setError("Failed to load food orders. Please try again later.");
        setStudentOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentOrders();
  }, []);

  const calculateTotalSpent = () => {
    return studentOrders.reduce((total, order) => total + order.price, 0).toFixed(2);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Group orders by date
  const groupOrdersByDate = () => {
    const grouped = {};
    
    studentOrders.forEach(order => {
      const date = new Date(order.orderTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(order);
    });
    
    return grouped;
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return today.toDateString() === date.toDateString();
  };

  const ordersGroupedByDate = groupOrdersByDate();
  const orderDates = Object.keys(ordersGroupedByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-light">
      {/* Include the shared navbar component */}
      <StudentNavbar activeView={activeView} studentData={studentData} />

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 bg-light">
        {/* Desktop Header - with centered title similar to Academic Report */}
        <header className="relative flex justify-center items-center mb-6 hidden md:flex">
          <button 
            onClick={() => navigate("/stud")}
            className="absolute left-0 text-primary hover:text-secondary"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold text-dark">Recent Food Orders</h2>
        </header>

        {/* Mobile Header with centered title */}
        <div className="md:hidden mb-6">
          <div className="flex items-center relative">
            <button 
              onClick={() => navigate("/stud")}
              className="text-primary hover:text-secondary"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-dark">
              Recent Food Orders
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-dark2 font-medium">Loading your food orders...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-4">Last 3 Days Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm text-center">
                  <p className="text-xs text-indigo-100">Total Orders</p>
                  <p className="text-3xl font-bold">{studentOrders.length}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm text-center">
                  <p className="text-xs text-indigo-100">Total Spent</p>
                  <p className="text-3xl font-bold">${calculateTotalSpent()}</p>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm text-center">
                  <p className="text-xs text-indigo-100">Avg. Order Price</p>
                  <p className="text-3xl font-bold">
                    ${studentOrders.length > 0 
                      ? (calculateTotalSpent() / studentOrders.length).toFixed(2) 
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-light rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <FaUtensils className="text-primary mr-3" />
                Your Recent Orders
              </h3>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              {orderDates.length > 0 ? (
                <div className="space-y-8">
                  {orderDates.map(date => (
                    <div key={date} className="pb-6 border-b border-gray-200 last:border-0">
                      <h4 className={`font-semibold ${isToday(date) ? 'text-primary' : 'text-dark2'} mb-4 flex items-center`}>
                        <FaCalendarAlt className="mr-2 text-primary" />
                        {isToday(date) ? 'Today' : formatDate(date)}
                      </h4>
                      <div className="space-y-4">
                        {ordersGroupedByDate[date].map((order, index) => (
                          <div 
                            key={index} 
                            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="flex items-start gap-4">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-full">
                                  <FaUtensils className="text-lg text-primary" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-dark">
                                    {order.menuItemName}
                                  </h5>
                                  <p className="text-dark2 text-sm">
                                    {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 md:mt-0 flex flex-col items-end">
                                <div className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                                  ${order.price.toFixed(2)}
                                </div>
                                <p className="text-dark2 text-sm mt-1">
                                  Qty: {order.quantity || 1}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FaUtensils className="text-gray-300 text-5xl mx-auto mb-4" />
                  <h4 className="text-xl font-medium text-gray-500 mb-2">No Recent Orders</h4>
                  <p className="text-gray-400">
                    You don't have any food orders in the last 3 days.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFoodOrders;