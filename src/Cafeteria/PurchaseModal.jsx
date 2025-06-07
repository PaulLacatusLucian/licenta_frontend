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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header mit Schließen-Button */}
                <div className="relative">
                    <div className="h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400 text-6xl">🍽️</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md"
                    >
                        <FaTimes />
                    </button>
                </div>
                
                {/* Inhalt */}
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">{item.name}</h2>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    
                    {/* Preis */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                        <span className="text-gray-700">{t('purchaseModal.pricePerItem')}:</span>
                        <span className="font-bold text-lg text-primary">${item.price.toFixed(2)}</span>
                    </div>
                    
                    {/* Allergene */}
                    {item.allergens && item.allergens.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('purchaseModal.allergens')}:</h3>
                            <div className="flex flex-wrap gap-2">
                                {item.allergens.map((allergenId) => {
                                    const allergen = ALLERGENS.find((a) => a.id === allergenId);
                                    return allergen ? (
                                        <span
                                            key={allergen.id}
                                            className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm flex items-center"
                                        >
                                            {allergen.emoji} {t(allergen.name)}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* Mengensteuerung */}
                    <div className="mb-6">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('purchaseModal.quantity')}: <span className="text-gray-500 text-xs">({t('purchaseModal.available', { count: item.quantity })})</span>
                        </label>
                        <div className="flex items-center">
                            <button 
                                onClick={decrementQuantity}
                                disabled={quantity <= 1}
                                className={`p-2 rounded-l-md ${
                                    quantity <= 1 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <FaMinus />
                            </button>
                            <input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="p-2 border-t border-b text-center w-16 focus:outline-none"
                                min="1"
                                max={item.quantity}
                            />
                            <button 
                                onClick={incrementQuantity}
                                disabled={quantity >= item.quantity}
                                className={`p-2 rounded-r-md ${
                                    quantity >= item.quantity 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                    
                    {/* Gesamtpreis */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{t('purchaseModal.totalPrice')}:</span>
                            <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    {/* Aktionsschaltflächen */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handlePurchaseClick}
                            className="flex-1 bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
                        >
                            <FaShoppingCart className="mr-2" />
                            {t('purchaseModal.confirmPurchase')}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                        >
                            {t('purchaseModal.cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseModal;