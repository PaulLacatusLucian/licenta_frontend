import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "../../../axiosConfig.js";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import AdminFoodCard from "../../../Cafeteria/FoodCards/AdminFoodCard";
import { 
  FaPlus, 
  FaSignOutAlt, 
  FaSearch, 
  FaSortAmountDown, 
  FaFilter, 
  FaSpinner,
  FaExclamationCircle,
  FaGlobe 
} from "react-icons/fa";

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
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <FaGlobe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{currentLanguage.flag} {currentLanguage.name}</span>
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

const AdminMenuList = () => {
    const { t } = useTranslation();
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState("all");
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
                // Allergene verarbeiten
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
            setError(t('chef.dashboard.errors.loadFailed'));
            setLoading(false);
        }
    };

    const filterAndSortItems = () => {
        // Erst filtern
        let filtered = menuItems.filter((item) => {
            // Suchbegriff Filter
            const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  item.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Lagerbestand Filter
            let matchesStockFilter = true;
            if (filterType === "inStock") matchesStockFilter = item.quantity > 5;
            else if (filterType === "lowStock") matchesStockFilter = item.quantity > 0 && item.quantity <= 5;
            else if (filterType === "outOfStock") matchesStockFilter = item.quantity === 0;
            
            return matchesSearch && matchesStockFilter;
        });
        
        // Dann sortieren
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
        if (!window.confirm(t('chef.dashboard.deleteConfirm'))) {
            return;
        }

        try {
            await axios.delete(`/menu/${menuItemId}`);
            setMenuItems(menuItems.filter((item) => item.id !== menuItemId));
            
            // Erfolgsbenachrichtigung anzeigen
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-100 text-green-800 p-4 rounded-lg shadow-lg z-50';
            notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>${t('chef.dashboard.deleteSuccess')}</div>`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        } catch (error) {
            console.error("Error deleting item:", error);
            
            // Fehlerbenachrichtigung anzeigen
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-100 text-red-800 p-4 rounded-lg shadow-lg z-50';
            notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>${t('chef.dashboard.deleteError')}</div>`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }
    };
    
    const handleEdit = (menuItemId) => {
        // Zur Bearbeitungsseite navigieren
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

    // Ladezustand anzeigen
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-primary text-4xl mb-4" />
                    <p className="text-gray-700 text-lg">{t('chef.dashboard.loading')}</p>
                </div>
            </div>
        );
    }

    // Fehlerzustand anzeigen
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                    <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('chef.dashboard.error')}</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={fetchMenuItems}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md shadow-md"
                    >
                        {t('chef.dashboard.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header mit Steuerungen */}
            <div className="bg-white shadow-sm py-6 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <h1 className="text-2xl font-bold text-gray-800">{t('chef.dashboard.title')}</h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <LanguageSwitcher />
                            <button
                                onClick={goToAddFood}
                                className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md shadow-md flex items-center"
                            >
                                <FaPlus className="mr-2" /> {t('chef.dashboard.addItem')}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md flex items-center"
                            >
                                <FaSignOutAlt className="mr-2" /> {t('chef.dashboard.logout')}
                            </button>
                        </div>
                    </div>
                    
                    {/* Suche und Filter */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {/* Suchfeld */}
                        <div className="sm:col-span-5 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={t('chef.dashboard.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                        </div>
                        
                        {/* Lagerbestand Filter */}
                        <div className="sm:col-span-3">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="all">{t('chef.dashboard.filters.all')}</option>
                                <option value="inStock">{t('chef.dashboard.filters.highStock')}</option>
                                <option value="lowStock">{t('chef.dashboard.filters.lowStock')}</option>
                                <option value="outOfStock">{t('chef.dashboard.filters.outOfStock')}</option>
                            </select>
                        </div>
                        
                        {/* Sortierungsoptionen */}
                        <div className="sm:col-span-4 flex space-x-2">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="name">{t('chef.dashboard.sortBy.name')}</option>
                                <option value="price">{t('chef.dashboard.sortBy.price')}</option>
                                <option value="quantity">{t('chef.dashboard.sortBy.quantity')}</option>
                            </select>
                            <button
                                onClick={toggleSortDirection}
                                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                                title={sortDirection === "asc" ? t('chef.dashboard.sortAsc') : t('chef.dashboard.sortDesc')}
                            >
                                <FaSortAmountDown className={`transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Ergebniszusammenfassung */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">
                        {t('chef.dashboard.itemsFound', { count: filteredItems.length })}
                    </h2>
                    
                    {searchTerm && (
                        <div className="text-sm text-gray-500">
                            {t('chef.dashboard.searchResults')} <span className="font-medium">{searchTerm}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Menüartikel Raster */}
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
                        <h3 className="text-xl font-medium text-gray-800 mb-2">{t('chef.dashboard.noItems')}</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || filterType !== "all" ? 
                                t('chef.dashboard.adjustFilters') : 
                                t('chef.dashboard.noItemsYet')}
                        </p>
                        <button
                            onClick={goToAddFood}
                            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-md inline-flex items-center"
                        >
                            <FaPlus className="mr-2" /> {t('chef.dashboard.addNewItem')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMenuList;