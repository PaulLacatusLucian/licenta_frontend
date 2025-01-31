import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaSearch, FaFilter, FaSignOutAlt, FaUser } from "react-icons/fa";

const ALLERGENS = [
    { id: "gluten", name: "Gluten", emoji: "🌾" },
    { id: "nuts", name: "Nuts", emoji: "🥜" },
    { id: "dairy", name: "Dairy", emoji: "🧀" },
    { id: "eggs", name: "Eggs", emoji: "🥚" },
    { id: "seafood", name: "Seafood", emoji: "🦐" },
    { id: "soy", name: "Soy", emoji: "🌱" },
];

const Navbar = ({ searchTerm, setSearchTerm, selectedAllergens, setSelectedAllergens }) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        Cookies.remove("userId");
        Cookies.remove("isEmployee");
        navigate("/");
    };

    const goToProfile = () => {
        navigate("/cafeteria/profile");
    };

    const toggleAllergen = (allergen) => {
        if (selectedAllergens.includes(allergen)) {
            setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen));
        } else {
            setSelectedAllergens([...selectedAllergens, allergen]);
        }
    };

    return (
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
    );
};

export default Navbar;