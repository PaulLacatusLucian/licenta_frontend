import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "../../../axiosConfig.js";
import { useNavigate } from "react-router-dom";
import AdminFoodCard from "../../../Cafeteria/FoodCards/AdminFoodCard";
import { 
  FaPlus, 
  FaSignOutAlt, 
  FaSearch, 
  FaSortAmountDown, 
  FaFilter, 
  FaSpinner,
  FaExclamationCircle 
} from "react-icons/fa";

const AdminMenuList = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState("all"); // all, inStock, lowStock, outOfStock
    const navigate = useNavigate();

    useEffect(() => {
        fetchMenuItems();
    }, []);

    useEffect(() => {
        filterAndSortItems();
    }, [menuItems, searchTerm, sortBy, sortDirection, filterType]);

    const fetchMenuItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/menu/all");
            const processedItems = response.data.map((item) => ({
                ...item,
                // Process allergens
                allergens: item.allergens.map((a) => {
                    try {
                        return typeof a === 'string' ? 
                            JSON.parse(a.replace(/\\/g, "").replace(/^\[|]$/g, "")) : a;
                    } catch (error) {
                        console.error("Failed to parse allergen:", a, error);
                        return null;
                    }
                }).filter(Boolean),
            }));
            setMenuItems(processedItems);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching menu items:", error);
            setError("Failed to load menu items. Please try again.");
            setLoading(false);
        }
    };

    const filterAndSortItems = () => {
        // First filter the items
        let filtered = menuItems.filter((item) => {
            // Search term filter
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  item.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Stock status filter
            let matchesStockFilter = true;
            if (filterType === "inStock") matchesStockFilter = item.quantity > 5;
            else if (filterType === "lowStock") matchesStockFilter = item.quantity > 0 && item.quantity <= 5;
            else if (filterType === "outOfStock") matchesStockFilter = item.quantity === 0;
            
            return matchesSearch && matchesStockFilter;
        });
        
        // Then sort the filtered items
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case "price":
                    comparison = (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
                    break;
                case "quantity":
                    comparison = (parseInt(a.quantity) || 0) - (parseInt(b.quantity) || 0);
                    break;
                default: // "name"
                    comparison = (a.name || "").localeCompare(b.name || "");
                    break;
            }
            
            return sortDirection === "asc" ? comparison : -comparison;
        });
        
        setFilteredItems(filtered);
    };

    const handleDelete = async (menuItemId) => {
        if (!window.confirm("Are you sure you want to delete this item from the menu?")) {
            return;
        }

        try {
            await axios.delete(`/menu/${menuItemId}`);
            setMenuItems(menuItems.filter((item) => item.id !== menuItemId));
            
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-lg shadow-lg z-50';
            notification.innerHTML = '<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>Item deleted successfully.</div>';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        } catch (error) {
            console.error("Error deleting item:", error);
            
            // Show error notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-100 text-red-800 p-4 rounded-lg shadow-lg z-50';
            notification.innerHTML = '<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>Error deleting item.</div>';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }
    };
    
    const handleEdit = (menuItemId) => {
        // Navigate to edit page with item ID
        navigate(`/edit-food/${menuItemId}`);
    };

    const goToAddFood = () => {
        navigate("/add-food");
    };

    const handleLogout = () => {
        Cookies.remove("userId");
        Cookies.remove("isEmployee");
        Cookies.remove("jwt-token");
        navigate("/login");
    };
    
    const toggleSortDirection = () => {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    };
    
    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            toggleSortDirection();
        } else {
            setSortBy(newSortBy);
            setSortDirection("asc");
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-primary text-4xl mb-4" />
                    <p className="text-gray-700 text-lg">Loading menu items...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                    <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={fetchMenuItems}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md shadow-md"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header with controls */}
            <div className="bg-white shadow-sm py-6 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <h1 className="text-2xl font-bold text-gray-800">Admin Menu Management</h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={goToAddFood}
                                className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md shadow-md flex items-center"
                            >
                                <FaPlus className="mr-2" /> Add Item
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md flex items-center"
                            >
                                <FaSignOutAlt className="mr-2" /> Logout
                            </button>
                        </div>
                    </div>
                    
                    {/* Search and filters */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {/* Search box */}
                        <div className="sm:col-span-5 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                        </div>
                        
                        {/* Stock filter */}
                        <div className="sm:col-span-3">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="all">All Items</option>
                                <option value="inStock">In Stock</option>
                                <option value="lowStock">Low Stock</option>
                                <option value="outOfStock">Out of Stock</option>
                            </select>
                        </div>
                        
                        {/* Sort options */}
                        <div className="sm:col-span-4 flex space-x-2">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="price">Sort by Price</option>
                                <option value="quantity">Sort by Quantity</option>
                            </select>
                            <button
                                onClick={toggleSortDirection}
                                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                                title={sortDirection === "asc" ? "Ascending" : "Descending"}
                            >
                                <FaSortAmountDown className={`transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Results summary */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">
                        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
                    </h2>
                    
                    {searchTerm && (
                        <div className="text-sm text-gray-500">
                            Search results for: <span className="font-medium">{searchTerm}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Menu items grid */}
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <AdminFoodCard
                                key={item.id}
                                name={item.name}
                                description={item.description}
                                price={item.price}
                                quantity={item.quantity}
                                imageUrl={item.imageUrl}
                                allergens={item.allergens}
                                onDelete={() => handleDelete(item.id)}
                                onEdit={() => handleEdit(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="text-gray-400 text-6xl mb-4">
                            <FaExclamationCircle className="mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 mb-2">No items found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || filterType !== "all" ? 
                                "Try adjusting your search or filters to see more results." : 
                                "There are no items in the menu yet. Start by adding a new item."}
                        </p>
                        <button
                            onClick={goToAddFood}
                            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-md inline-flex items-center"
                        >
                            <FaPlus className="mr-2" /> Add New Item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMenuList;