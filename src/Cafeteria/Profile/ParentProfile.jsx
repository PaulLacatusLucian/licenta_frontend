import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
    FaSpinner,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";

function MyProfile() {
    const { t } = useTranslation();
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
    
    const isCurrentMonth = month === currentMonth && year === currentYear;
    
    const months = t('profile.months', { returnObjects: true });

    useEffect(() => {
        fetchOrderHistory();
    }, [month, year]);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`/menu/me/child/orders`, {
                params: { month, year }
            });
            
            setOrderHistory(response.data || []);
            
            const total = response.data.reduce((sum, order) => sum + (order.price || 0), 0);
            setTotalSpent(total);
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching order history:", error.response ? error.response.data : error);
            setError(t('profile.errors.loadFailed'));
            setLoading(false);
        }
    };

    const downloadInvoice = async () => {
        try {
            setDownloading(true);
            
            const response = await axios.get(`/menu/me/invoice`, {
                params: { month, year },
                responseType: 'blob'
            });
    
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
            setError(t('profile.errors.downloadFailed'));
            setDownloading(false);
        }
    };

    const goToMenu = () => {
        navigate("/cafeteria");
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        // For mobile, use a shorter format
        if (window.innerWidth < 640) {
            return date.toLocaleDateString(t('profile.dateLocale'), { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return date.toLocaleDateString(t('profile.dateLocale'), options);
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
            return;
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center">
                            <button
                                onClick={goToMenu}
                                className="mr-3 sm:mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label={t('profile.backToMenu')}
                            >
                                <FaArrowLeft className="text-gray-700 text-sm sm:text-base" />
                            </button>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                                <FaReceipt className="mr-2 sm:mr-3 text-primary text-lg sm:text-xl" /> 
                                <span className="hidden sm:inline">{t('profile.title')}</span>
                                <span className="sm:hidden">{t('profile.title')}</span>
                            </h1>
                        </div>
                        
                        <button
                            onClick={downloadInvoice}
                            disabled={downloading || orderHistory.length === 0}
                            className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                                downloading || orderHistory.length === 0
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-primary text-white hover:bg-secondary"
                            } transition-colors`}
                        >
                            {downloading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2 text-sm sm:text-base" /> 
                                    <span className="hidden sm:inline">{t('profile.downloading')}</span>
                                    <span className="sm:hidden">{t('profile.downloadingShort') || '...'}</span>
                                </>
                            ) : (
                                <>
                                    <FaFileInvoiceDollar className="mr-2 text-sm sm:text-base" /> 
                                    <span className="hidden sm:inline">{t('profile.downloadInvoice')}</span>
                                    <span className="sm:hidden">{t('profile.invoice') || 'Invoice'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {error && (
                    <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                        {error}
                    </div>
                )}
                
                {/* Month selector */}
                <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                            <FaCalendarAlt className="mr-2 text-primary text-sm sm:text-base" /> {t('profile.selectPeriod')}
                        </h2>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between max-w-sm mx-auto">
                            <button 
                                onClick={handlePreviousMonth}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label={t('profile.previousMonth')}
                            >
                                <FaChevronLeft className="text-gray-600 text-sm sm:text-base" />
                            </button>
                            
                            <div className="text-center px-4">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
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
                                aria-label={t('profile.nextMonth')}
                            >
                                <FaChevronRight className="text-sm sm:text-base" />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Order statistics - Mobile optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="rounded-full p-2 sm:p-3 bg-blue-100 mr-3 sm:mr-4">
                                <FaShoppingCart className="text-blue-600 text-sm sm:text-base" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">{t('profile.stats.totalOrders')}</p>
                                <p className="text-xl sm:text-2xl font-bold">{orderHistory.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="rounded-full p-2 sm:p-3 bg-green-100 mr-3 sm:mr-4">
                                <FaFileInvoiceDollar className="text-green-600 text-sm sm:text-base" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">{t('profile.stats.totalSpent')}</p>
                                <p className="text-xl sm:text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <div className="flex items-center">
                            <div className="rounded-full p-2 sm:p-3 bg-purple-100 mr-3 sm:mr-4">
                                <FaUtensils className="text-purple-600 text-sm sm:text-base" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">{t('profile.stats.avgPrice')}</p>
                                <p className="text-xl sm:text-2xl font-bold">
                                    ${orderHistory.length > 0 
                                        ? (totalSpent / orderHistory.length).toFixed(2) 
                                        : '0.00'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Order history list - Mobile optimized */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                            <FaReceipt className="mr-2 text-primary text-sm sm:text-base" /> {t('profile.orderHistory')}
                        </h2>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center p-8 sm:p-12">
                            <FaSpinner className="animate-spin text-primary text-2xl sm:text-3xl" />
                        </div>
                    ) : orderHistory.length > 0 ? (
                        <>
                            {/* Mobile view - Cards */}
                            <div className="sm:hidden">
                                {orderHistory.map((order) => (
                                    <div key={order.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 text-sm">{order.menuItemName}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(order.orderTime)}</p>
                                            </div>
                                            <div className="text-right ml-3">
                                                <p className="font-semibold text-gray-900">${order.price?.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop view - Table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('profile.table.item')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('profile.table.quantity')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('profile.table.price')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('profile.table.date')}
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
                        </>
                    ) : (
                        <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
                            <svg
                                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('profile.noOrdersTitle')}</h3>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                {t('profile.noOrdersDescription', { month: months[month - 1], year })}
                            </p>
                            {isCurrentMonth && (
                                <div className="mt-4 sm:mt-6">
                                    <button
                                        onClick={goToMenu}
                                        className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        <FaUtensils className="mr-2 text-xs sm:text-sm" /> {t('profile.orderFood')}
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