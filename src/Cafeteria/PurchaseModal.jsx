import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { FaMinus, FaPlus, FaCheck, FaTimes, FaShoppingCart } from "react-icons/fa";

const ALLERGENS = [
    { id: "gluten", name: "allergens.gluten", emoji: "🌾" },
    { id: "nuts", name: "allergens.nuts", emoji: "🥜" },
    { id: "dairy", name: "allergens.dairy", emoji: "🧀" },
    { id: "eggs", name: "allergens.eggs", emoji: "🥚" },
    { id: "seafood", name: "allergens.seafood", emoji: "🦐" },
    { id: "soy", name: "allergens.soy", emoji: "🌱" },
];

const PurchaseModal = ({ isOpen, onClose, item, onPurchase }) => {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    
    useEffect(() => {
        if (item) {
            setTotalPrice(item.price * quantity);
        }
    }, [quantity, item]);
    
    useEffect(() => {
        if (isOpen && item) {
            setQuantity(1);
        }
    }, [isOpen, item]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const handlePurchaseClick = () => {
        onPurchase(item.id, quantity);
    };

    const handleQuantityChange = (e) => {
        const value = Math.max(1, Math.min(parseInt(e.target.value, 10) || 1, item.quantity));
        setQuantity(value);
    };
    
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
    
    const incrementQuantity = () => {
        if (quantity < item.quantity) {
            setQuantity(quantity + 1);
        }
    };
    
    const imageSrc = item.imageUrl?.startsWith("/images/")
        ? `http://localhost:8080${item.imageUrl}`
        : item.imageUrl;
        
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end sm:items-center p-0 sm:p-4 z-50">
            <div 
                className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-none" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header with close button */}
                <div className="relative">
                    <div className="h-48 sm:h-48 w-full overflow-hidden rounded-t-2xl sm:rounded-t-xl bg-gray-100">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400 text-5xl sm:text-6xl">🍽️</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md"
                    >
                        <FaTimes className="text-sm sm:text-base" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">{item.name}</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">{item.description}</p>
                    
                    {/* Price */}
                    <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 border-b border-gray-200">
                        <span className="text-sm sm:text-base text-gray-700">{t('purchaseModal.pricePerItem')}:</span>
                        <span className="font-bold text-base sm:text-lg text-primary">${item.price.toFixed(2)}</span>
                    </div>
                    
                    {/* Allergens */}
                    {item.allergens && item.allergens.length > 0 && (
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{t('purchaseModal.allergens')}:</h3>
                            <div className="flex flex-wrap gap-2">
                                {item.allergens.map((allergenId) => {
                                    const allergen = ALLERGENS.find((a) => a.id === allergenId);
                                    return allergen ? (
                                        <span
                                            key={allergen.id}
                                            className="bg-gray-100 text-gray-700 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm flex items-center"
                                        >
                                            {allergen.emoji} <span className="ml-1">{t(allergen.name)}</span>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* Quantity control */}
                    <div className="mb-4 sm:mb-6">
                        <label htmlFor="quantity" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            {t('purchaseModal.quantity')}: <span className="text-gray-500 text-xs">({t('purchaseModal.available', { count: item.quantity })})</span>
                        </label>
                        <div className="flex items-center justify-center sm:justify-start">
                            <button 
                                onClick={decrementQuantity}
                                disabled={quantity <= 1}
                                className={`p-3 sm:p-2 rounded-l-md ${
                                    quantity <= 1 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
                                } transition-colors`}
                            >
                                <FaMinus className="text-sm" />
                            </button>
                            <input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="p-3 sm:p-2 border-t border-b text-center w-20 sm:w-16 focus:outline-none text-base sm:text-sm"
                                min="1"
                                max={item.quantity}
                            />
                            <button 
                                onClick={incrementQuantity}
                                disabled={quantity >= item.quantity}
                                className={`p-3 sm:p-2 rounded-r-md ${
                                    quantity >= item.quantity 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
                                } transition-colors`}
                            >
                                <FaPlus className="text-sm" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Total price */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 sm:mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-sm sm:text-base">{t('purchaseModal.totalPrice')}:</span>
                            <span className="text-lg sm:text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    {/* Action buttons - Sticky on mobile */}
                    <div className="flex flex-col sm:flex-row gap-3 sticky sm:relative bottom-0 bg-white pt-2 sm:pt-0">
                        <button
                            onClick={handlePurchaseClick}
                            className="flex-1 bg-primary hover:bg-secondary active:bg-secondary text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors text-sm sm:text-base"
                        >
                            <FaShoppingCart className="mr-2" />
                            {t('purchaseModal.confirmPurchase')}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
                        >
                            {t('purchaseModal.cancel')}
                        </button>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default PurchaseModal;