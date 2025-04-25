import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import { 
    FaCalendarAlt, 
    FaFileInvoiceDollar, 
    FaUtensils, 
    FaArrowLeft, 
    FaDownload,
    FaShoppingCart,
    FaReceipt,
    FaSpinner
} from "react-icons/fa";

function MyProfile() {
    const [orderHistory, setOrderHistory] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);
    const [totalSpent, setTotalSpent] = useState(0);
    const navigate = useNavigate();

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Check if we're viewing the current month
    const isCurrentMonth = month === currentMonth && year === currentYear;
    
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        fetchOrderHistory();
    }, [month, year]);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use the new /me endpoint - token will be sent automatically via axios
            const response = await axios.get(`/menu/me/child/orders`, {
                params: { month, year }
            });
            
            setOrderHistory(response.data || []);
            
            // Calculate total spent
            const total = response.data.reduce((sum, order) => sum + (order.price || 0), 0);
            setTotalSpent(total);
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching order history:", error.response ? error.response.data : error);
            setError("Failed to load order history. Please try again.");
            setLoading(false);
        }
    };

    const downloadInvoice = async () => {
        try {
            setDownloading(true);
            
            // Use the new /me/invoice endpoint
            const response = await axios.get(`/menu/me/invoice`, {
                params: { month, year },
                responseType: 'blob'
            });
    
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `food_invoice_${month}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setDownloading(false);
        } catch (error) {
            console.error("Error downloading invoice:", error);
            setError("Failed to download invoice. Please try again.");
            setDownloading(false);
        }
    };

    const goToMenu = () => {
        navigate("/cafeteria");
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const handlePreviousMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };
    
    const handleNextMonth = () => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        if (year === currentYear && month === currentMonth) {
            return; // Don't allow going beyond current month
        }
        
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <button
                                onClick={goToMenu}
                                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Back to menu"
                            >
                                <FaArrowLeft className="text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                <FaReceipt className="mr-3 text-primary" /> Order History
                            </h1>
                        </div>
                        
                        <button
                            onClick={downloadInvoice}
                            disabled={downloading || orderHistory.length === 0}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                                downloading || orderHistory.length === 0
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-primary text-white hover:bg-secondary"
                            } transition-colors`}
                        >
                            {downloading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" /> 
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <FaFileInvoiceDollar className="mr-2" /> 
                                    Download Invoice
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                
                {/* Month Selector */}
                <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FaCalendarAlt className="mr-2 text-primary" /> Select Period
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={handlePreviousMonth}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Previous month"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {months[month - 1]} {year}
                                </h3>
                            </div>
                            
                            <button 
                                onClick={handleNextMonth}
                                className={`p-2 rounded-full ${
                                    month === new Date().getMonth() + 1 && year === new Date().getFullYear()
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "hover:bg-gray-100 text-gray-600"
                                } transition-colors`}
                                disabled={month === new Date().getMonth() + 1 && year === new Date().getFullYear()}
                                aria-label="Next month"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Order Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="rounded-full p-3 bg-blue-100 mr-4">
                                <FaShoppingCart className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold">{orderHistory.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="rounded-full p-3 bg-green-100 mr-4">
                                <FaFileInvoiceDollar className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Spent</p>
                                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="rounded-full p-3 bg-purple-100 mr-4">
                                <FaUtensils className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Avg. Price Per Order</p>
                                <p className="text-2xl font-bold">
                                    ${orderHistory.length > 0 
                                        ? (totalSpent / orderHistory.length).toFixed(2) 
                                        : '0.00'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Order History List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FaReceipt className="mr-2 text-primary" /> Order History
                        </h2>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center p-12">
                            <FaSpinner className="animate-spin text-primary text-3xl" />
                        </div>
                    ) : orderHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orderHistory.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{order.menuItemName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{order.quantity}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">${order.price?.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.orderTime)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 px-6">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No orders were placed during {months[month - 1]} {year}.
                            </p>
                            {/* Only show Order Food button for current month */}
                            {isCurrentMonth && (
                                <div className="mt-6">
                                    <button
                                        onClick={goToMenu}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        <FaUtensils className="mr-2" /> Order Food
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyProfile;