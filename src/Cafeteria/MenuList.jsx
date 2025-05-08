import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "../axiosConfig";
import FoodCard from "../Cafeteria/FoodCards/FoodCard";
import PurchaseModal from "./PurchaseModal";
import { 
    FaSearch, 
    FaUtensils, 
    FaSadTear, 
    FaShoppingCart, 
    FaExclamationTriangle,
    FaSortAmountUp,
    FaSortAmountDown,
    FaFilter,
    FaCheck,
    FaSignOutAlt,
    FaUser,
    FaArrowLeft
} from "react-icons/fa";

const ALLERGENS = [
    { id: "gluten", name: "Gluten", emoji: "🌾" },
    { id: "nuts", name: "Nuts", emoji: "🥜" },
    { id: "dairy", name: "Dairy", emoji: "🧀" },
    { id: "eggs", name: "Eggs", emoji: "🥚" },
    { id: "seafood", name: "Seafood", emoji: "🦐" },
    { id: "soy", name: "Soy", emoji: "🌱" },
];

const MenuList = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("name"); // name, price, quantity
    const [sortDirection, setSortDirection] = useState("asc"); // asc, desc
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [notification, setNotification] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setLoading(true);
        axios
            .get("/menu/all")
            .then((response) => {
                const processedItems = response.data.map((item) => ({
                    ...item,
                    allergens: item.allergens?.map((a) => {
                        try {
                            return typeof a === 'string' ? 
                                JSON.parse(a.replace(/\\/g, "").replace(/^\[|]$/g, "")) : a;
                        } catch (error) {
                            console.error("Failed to parse allergen:", a, error);
                            return null;
                        }
                    }).filter(Boolean) || [],
                }));
                setMenuItems(processedItems);
                setFilteredItems(processedItems);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching menu items:", error);
                setError("Failed to load menu items. Please try again later.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        filterAndSortItems();
    }, [searchTerm, selectedAllergens, menuItems, sortBy, sortDirection]);

    const filterAndSortItems = () => {
        // First filter the items
        let filtered = menuItems.filter((item) => {
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAllergens =
                selectedAllergens.length === 0 ||
                selectedAllergens.every((allergen) => 
                    item.allergens && item.allergens.includes(allergen)
                );
            return matchesSearch && matchesAllergens;
        });
        
        // Then sort the filtered items
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case "price":
                    comparison = (a.price || 0) - (b.price || 0);
                    break;
                case "quantity":
                    comparison = (a.quantity || 0) - (b.quantity || 0);
                    break;
                default: // "name"
                    comparison = (a.name || "").localeCompare(b.name || "");
                    break;
            }
            
            return sortDirection === "asc" ? comparison : -comparison;
        });
        
        setFilteredItems(filtered);
    };

    const getAvailableItemsCount = () => {
        return filteredItems.filter(item => item.quantity > 0).length;
    };

    const openModal = (item) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedItem(null);
    };

    const handlePurchase = async (menuItemId, quantity) => {
        try {
            // Using the new endpoint that extracts parent and student info from the token
            await axios.post(`/menu/me/purchase/${menuItemId}`, null, {
                params: { quantity }
            });
            
            // Update the menu item quantity locally
            const updatedItems = menuItems.map(item => {
                if (item.id === menuItemId) {
                    return { ...item, quantity: item.quantity - quantity };
                }
                return item;
            });
            
            setMenuItems(updatedItems);
            
            showNotification("Purchase successful! Your order has been placed.", "success");
            closeModal();
        } catch (error) {
            console.error("Error purchasing item:", error);
            showNotification(
                `Error purchasing item: ${error.response?.data || error.message}`, 
                "error"
            );
        }
    };
    
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
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
        setShowSortOptions(false);
    };
    
    const toggleAllergen = (allergen) => {
        if (selectedAllergens.includes(allergen)) {
            setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen));
        } else {
            setSelectedAllergens([...selectedAllergens, allergen]);
        }
    };
    
    const handleLogout = () => {
        Cookies.remove("userId");
        Cookies.remove("studentId");
        Cookies.remove("jwt-token");
        navigate("/login");
    };

    const goToProfile = () => {
        navigate("/cafeteria/profile");
    };
    
    const goToDashboard = () => {
        navigate("/parent");
    };
    
    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Navigation */}
                <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary tracking-wide">
                                SchoolMenu
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="animate-pulse w-24 h-10 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </nav>
                
                <div className="flex-1 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-lg text-gray-600">Loading menu items...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Navigation */}
                <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary tracking-wide">
                                SchoolMenu
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={goToProfile}
                                className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100 transition-all duration-200"
                                title="Profile"
                            >
                                <FaUser className="text-xl" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-all duration-200"
                                title="Logout"
                            >
                                <FaSignOutAlt className="text-xl" />
                            </button>
                        </div>
                    </div>
                </nav>
                
                <div className="flex-1 flex justify-center items-center">
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
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Integrated Navigation */}
            <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-primary tracking-wide">
                            SchoolMenu
                        </h1>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <div className="flex items-center gap-4">
                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                                        dropdownOpen || selectedAllergens.length > 0
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    } transition-all duration-200`}
                                >
                                    <FaFilter className={`${selectedAllergens.length > 0 ? 'text-white' : 'text-gray-400'}`} />
                                    <span className="font-medium">
                                        {selectedAllergens.length ? `Filters (${selectedAllergens.length})` : 'Filters'}
                                    </span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                                        <div className="p-3 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-700">Dietary Restrictions</h3>
                                        </div>
                                        <ul className="py-2">
                                            {ALLERGENS.map((allergen) => (
                                                <li
                                                    key={allergen.id}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <label className="flex items-center space-x-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAllergens.includes(allergen.id)}
                                                            onChange={() => toggleAllergen(allergen.id)}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="flex items-center gap-2">
                                                            <span className="text-xl">{allergen.emoji}</span>
                                                            <span className="text-gray-700">{allergen.name}</span>
                                                        </span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile and Logout */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={goToProfile}
                            className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100 transition-all duration-200"
                            title="Profile"
                        >
                            <FaUser className="text-xl" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-all duration-200"
                            title="Logout"
                        >
                            <FaSignOutAlt className="text-xl" />
                        </button>
                    </div>
                </div>
            </nav>
            
            {/* Header section with title and search summary */}
            <div className="bg-white py-6 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                                <FaUtensils className="mr-3 text-primary" /> School Meal Menu
                            </h1>
                            <p className="text-gray-600">
                                {searchTerm && <span>Searching for: <span className="font-medium">"{searchTerm}"</span> • </span>}
                                {getAvailableItemsCount()} {getAvailableItemsCount() === 1 ? 'item' : 'items'} available
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Back to Dashboard Button */}
                            <button 
                                onClick={goToDashboard}
                                className="flex items-center text-white bg-primary hover:bg-primary-dark transition-colors text-sm px-4 py-2 rounded-lg shadow-sm"
                            >
                                <FaArrowLeft className="mr-2" /> Back to Dashboard
                            </button>
                            
                            {/* Sort Options */}
                            <div className="relative" ref={sortDropdownRef}>
                                <button
                                    onClick={() => setShowSortOptions(!showSortOptions)}
                                    className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span>Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                                    {sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
                                </button>
                                
                                {showSortOptions && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                                        <ul className="py-2">
                                            {["name", "price", "quantity"].map((option) => (
                                                <li key={option}>
                                                    <button
                                                        onClick={() => handleSortChange(option)}
                                                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                                                            sortBy === option ? "font-semibold text-primary" : ""
                                                        }`}
                                                    >
                                                        Sort by {option.charAt(0).toUpperCase() + option.slice(1)}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Menu grid */}
            <div className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map((item) => (
                                <FoodCard
                                    key={item.id}
                                    name={item.name}
                                    description={item.description}
                                    price={item.price}
                                    quantity={item.quantity}
                                    imageUrl={item.imageUrl}
                                    allergens={item.allergens}
                                    onBuy={() => openModal(item)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm p-10 text-center">
                            <FaSadTear className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No menu items available</h3>
                            <p className="text-gray-500 max-w-md">
                                {searchTerm || selectedAllergens.length > 0 ? 
                                    "No items match your current search criteria. Try adjusting your filters or search term." : 
                                    "There are currently no menu items available to order. Please check back later."
                                }
                            </p>
                            {(searchTerm || selectedAllergens.length > 0) && (
                                <button 
                                    className="mt-6 bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark transition flex items-center"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedAllergens([]);
                                    }}
                                >
                                    <FaSearch className="mr-2" /> View All Items
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Purchase modal */}
            <PurchaseModal
                isOpen={isModalOpen}
                onClose={closeModal}
                item={selectedItem}
                onPurchase={handlePurchase}
            />
            
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 max-w-md z-50 rounded-lg shadow-lg p-4 flex items-start space-x-4 ${
                    notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        notification.type === "success" ? "bg-green-200" : "bg-red-200"
                    }`}>
                        {notification.type === "success" ? (
                            <FaCheck className="w-3 h-3" />
                        ) : (
                            <FaExclamationTriangle className="w-3 h-3" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            {notification.message}
                        </p>
                    </div>
                </div>
            )}
            
            {/* Footer */}
            <footer className="bg-white shadow-inner py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex space-x-4">
                            <button 
                                onClick={goToProfile}
                                className="flex items-center text-primary hover:text-secondary transition-colors text-sm"
                            >
                                <FaShoppingCart className="mr-2" /> View My Orders
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MenuList;