import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
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
    FaArrowLeft,
    FaGlobe,
    FaBars,
    FaTimes
} from "react-icons/fa";

const ALLERGENS = [
    { id: "gluten", name: "allergens.gluten", emoji: "🌾" },
    { id: "nuts", name: "allergens.nuts", emoji: "🥜" },
    { id: "dairy", name: "allergens.dairy", emoji: "🧀" },
    { id: "eggs", name: "allergens.eggs", emoji: "🥚" },
    { id: "seafood", name: "allergens.seafood", emoji: "🦐" },
    { id: "soy", name: "allergens.soy", emoji: "🌱" },
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'ro', name: 'Română', flag: '🇷🇴' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100 transition-all duration-200"
                title="Change Language"
            >
                <FaGlobe className="text-lg sm:text-xl" />
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                                lang.code === i18n.language ? 'bg-gray-50' : ''
                            }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm text-gray-700">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const MenuList = () => {
    const { t } = useTranslation();
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [notification, setNotification] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const sortDropdownRef = useRef(null);

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
                setError(t('menuList.errors.loadFailed'));
                setLoading(false);
            });
    }, [t]);

    useEffect(() => {
        filterAndSortItems();
    }, [searchTerm, selectedAllergens, menuItems, sortBy, sortDirection]);

    const filterAndSortItems = () => {
        let filtered = menuItems.filter((item) => {
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAllergens =
                selectedAllergens.length === 0 ||
                selectedAllergens.every((allergen) => 
                    item.allergens && item.allergens.includes(allergen)
                );
            return matchesSearch && matchesAllergens;
        });
        
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case "price":
                    comparison = (a.price || 0) - (b.price || 0);
                    break;
                case "quantity":
                    comparison = (a.quantity || 0) - (b.quantity || 0);
                    break;
                default:
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
            await axios.post(`/menu/me/purchase/${menuItemId}`, null, {
                params: { quantity }
            });
            
            const updatedItems = menuItems.map(item => {
                if (item.id === menuItemId) {
                    return { ...item, quantity: item.quantity - quantity };
                }
                return item;
            });
            
            setMenuItems(updatedItems);
            
            showNotification(t('menuList.purchase.success'), "success");
            closeModal();
        } catch (error) {
            console.error("Error purchasing item:", error);
            showNotification(
                t('menuList.purchase.error', { error: error.response?.data || error.message }), 
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
        setMobileMenuOpen(false);
    };
    
    const goToDashboard = () => {
        navigate("/parent");
        setMobileMenuOpen(false);
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Navigation */}
                <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-lg sm:text-xl font-bold text-primary tracking-wide">
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
                        <p className="mt-4 text-lg text-gray-600">{t('menuList.loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Navigation */}
                <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-lg sm:text-xl font-bold text-primary tracking-wide">
                                SchoolMenu
                            </h1>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-4">
                            <LanguageSwitcher />
                            <button
                                onClick={goToProfile}
                                className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100 transition-all duration-200"
                                title={t('menuList.nav.profile')}
                            >
                                <FaUser className="text-lg sm:text-xl" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-all duration-200"
                                title={t('menuList.nav.logout')}
                            >
                                <FaSignOutAlt className="text-lg sm:text-xl" />
                            </button>
                        </div>
                    </div>
                </nav>
                
                <div className="flex-1 flex justify-center items-center p-4">
                    <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md max-w-lg w-full">
                        <h3 className="text-xl font-semibold mb-2">{t('menuList.error')}</h3>
                        <p>{error}</p>
                        <button
                            className="mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                            onClick={() => window.location.reload()}
                        >
                            {t('menuList.tryAgain')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navigation for Mobile and Desktop */}
            <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    {/* Mobile Navigation */}
                    <div className="lg:hidden flex items-center justify-between">
                        <h1 className="text-lg font-bold text-primary tracking-wide">
                            SchoolMenu
                        </h1>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100"
                            >
                                <FaSearch className="text-lg" />
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100"
                            >
                                {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
                            </button>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary tracking-wide">
                                SchoolMenu
                            </h1>
                        </div>

                        <div className="flex-1 max-w-2xl mx-8">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={t('menuList.searchPlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                    />
                                </div>

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
                                            {selectedAllergens.length ? t('menuList.filtersActive', { count: selectedAllergens.length }) : t('menuList.filters')}
                                        </span>
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                                            <div className="p-3 border-b border-gray-100">
                                                <h3 className="font-semibold text-gray-700">{t('menuList.dietaryRestrictions')}</h3>
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
                                                                <span className="text-gray-700">{t(allergen.name)}</span>
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

                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            <button
                                onClick={goToProfile}
                                className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100 transition-all duration-200"
                                title={t('menuList.nav.profile')}
                            >
                                <FaUser className="text-xl" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-all duration-200"
                                title={t('menuList.nav.logout')}
                            >
                                <FaSignOutAlt className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar (toggleable) */}
                    {mobileSearchOpen && (
                        <div className="lg:hidden mt-3 space-y-3">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('menuList.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                                        dropdownOpen || selectedAllergens.length > 0
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-700 border-gray-200'
                                    } transition-all duration-200`}
                                >
                                    <FaFilter className={`${selectedAllergens.length > 0 ? 'text-white' : 'text-gray-400'}`} />
                                    <span className="font-medium">
                                        {selectedAllergens.length ? t('menuList.filtersActive', { count: selectedAllergens.length }) : t('menuList.filters')}
                                    </span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                                        <div className="p-3 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-700">{t('menuList.dietaryRestrictions')}</h3>
                                        </div>
                                        <ul className="py-2">
                                            {ALLERGENS.map((allergen) => (
                                                <li
                                                    key={allergen.id}
                                                    className="px-4 py-2 hover:bg-gray-50"
                                                >
                                                    <label className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAllergens.includes(allergen.id)}
                                                            onChange={() => toggleAllergen(allergen.id)}
                                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="flex items-center gap-2">
                                                            <span className="text-xl">{allergen.emoji}</span>
                                                            <span className="text-gray-700">{t(allergen.name)}</span>
                                                        </span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden mt-3 border-t border-gray-200 pt-3">
                            <div className="space-y-2">
                                <button
                                    onClick={goToDashboard}
                                    className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    <FaArrowLeft className="mr-2" />
                                    {t('menuList.backToDashboard')}
                                </button>
                                <button
                                    onClick={goToProfile}
                                    className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    <FaUser className="mr-2" />
                                    {t('menuList.nav.profile')}
                                </button>
                                <LanguageSwitcher />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    {t('menuList.nav.logout')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
            
            {/* Header Section */}
            <div className="bg-white py-4 sm:py-6 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="mb-0 md:mb-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                                <FaUtensils className="mr-2 sm:mr-3 text-primary" /> {t('menuList.title')}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                {searchTerm && <span>{t('menuList.searchingFor')} <span className="font-medium">"{searchTerm}"</span> • </span>}
                                {t('menuList.itemsAvailable', { count: getAvailableItemsCount() })}
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button 
                                onClick={goToDashboard}
                                className="hidden lg:flex items-center justify-center text-white bg-primary hover:bg-primary-dark transition-colors text-sm px-4 py-2 rounded-lg shadow-sm"
                            >
                                <FaArrowLeft className="mr-2" /> {t('menuList.backToDashboard')}
                            </button>
                            
                            <div className="relative" ref={sortDropdownRef}>
                                <button
                                    onClick={() => setShowSortOptions(!showSortOptions)}
                                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span>{t('menuList.sortBy')}: {t(`menuList.sortOptions.${sortBy}`)}</span>
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
                                                        {t(`menuList.sortOptions.${option}`)}
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
            
            {/* Menu Grid */}
            <div className="flex-1 py-4 sm:py-6 lg:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                        <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm p-6 sm:p-10 text-center">
                            <FaSadTear className="text-5xl sm:text-6xl text-gray-300 mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">{t('menuList.noItemsTitle')}</h3>
                            <p className="text-sm sm:text-base text-gray-500 max-w-md">
                                {searchTerm || selectedAllergens.length > 0 ? 
                                    t('menuList.noItemsFiltered') : 
                                    t('menuList.noItemsAvailable')
                                }
                            </p>
                            {(searchTerm || selectedAllergens.length > 0) && (
                                <button 
                                    className="mt-6 bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark transition flex items-center text-sm sm:text-base"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedAllergens([]);
                                    }}
                                >
                                    <FaSearch className="mr-2" /> {t('menuList.viewAllItems')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Purchase Modal */}
            <PurchaseModal
                isOpen={isModalOpen}
                onClose={closeModal}
                item={selectedItem}
                onPurchase={handlePurchase}
            />
            
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 left-4 sm:left-auto max-w-md z-50 rounded-lg shadow-lg p-4 flex items-start space-x-4 ${
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
            
            {/* Footer - Hidden on mobile */}
            <footer className="hidden sm:block bg-white shadow-inner py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex space-x-4">
                            <button 
                                onClick={goToProfile}
                                className="flex items-center text-primary hover:text-secondary transition-colors text-sm"
                            >
                                <FaShoppingCart className="mr-2" /> {t('menuList.viewMyOrders')}
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MenuList;