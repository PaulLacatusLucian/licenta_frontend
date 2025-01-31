import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

function MyProfile() {
    const [orderHistory, setOrderHistory] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const navigate = useNavigate();

    const userId = Cookies.get("userId");
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        if (userId) {
            fetchOrderHistory();
        } else {
            console.error("User ID is missing! Please log in.");
        }
    }, [month, year, userId]);

    const fetchOrderHistory = async () => {
        try {
            console.log("Fetching order history for student:", userId);
    
            const response = await axios.get(`/menu/orders/student/${userId}/${month}/${year}`);
            console.log("✅ Order history response:", response.data);
    
            setOrderHistory(response.data);
        } catch (error) {
            console.error("❌ Error fetching order history:", error.response ? error.response.data : error);
        }
    };
    

    const downloadInvoice = async () => {
        if (!userId) {
            alert("User ID is missing! Please log in.");
            return;
        }
    
        try {
            const response = await axios.get(`/menu/${userId}/invoice/${month}/${year}/download`, {
                responseType: 'blob', // Obligatoriu pentru a primi datele binare (PDF)
            });
    
            // Creează un link pentru descărcare
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${month}_${year}.pdf`); // Setează numele fișierului
            document.body.appendChild(link);
            link.click(); // Simulează un click pentru descărcare
            link.remove(); // Elimină linkul după descărcare
        } catch (error) {
            console.error("Error downloading invoice:", error);
            alert("Failed to download invoice.");
        }
    };
    

    const goToMenu = () => {
        navigate("/cafeteria");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <h2 className="text-3xl font-semibold mb-6 text-primary">My Profile</h2>

            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-xl">
                <div className="mb-6">
                    <button
                        onClick={goToMenu}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md shadow-md"
                    >
                        Back to Menu
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Month:
                    </label>
                    <input
                        type="number"
                        value={month}
                        onChange={(e) =>
                            setMonth(Math.min(Math.max(1, parseInt(e.target.value, 10)), 12))
                        }
                        className="p-2 border border-gray-300 rounded-md w-full"
                        min="1"
                        max="12"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year:
                    </label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) =>
                            setYear(Math.min(Math.max(2000, parseInt(e.target.value, 10)), currentYear))
                        }
                        className="p-2 border border-gray-300 rounded-md w-full"
                        min="2000"
                        max={currentYear}
                    />
                </div>

                {/* Center the Download Invoice Button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={downloadInvoice}
                        className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-md shadow-md"
                    >
                        Download Invoice
                    </button>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Order History</h3>
                    {orderHistory.length > 0 ? (
                        <ul className="space-y-4">
                            {orderHistory.map((order) => (
                                <li
                                    key={order.id}
                                    className="p-4 bg-gray-100 rounded-md shadow-sm"
                                >
                                    <p className="font-semibold">{order.menuItemName}</p>
                                    <p className="text-sm text-gray-600">
                                        Quantity: {order.quantity} | Total: ${order.price}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Purchased on:{" "}
                                        {new Date(order.orderTime).toLocaleDateString()} at{" "}
                                        {new Date(order.orderTime).toLocaleTimeString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No orders found for this period.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyProfile;
