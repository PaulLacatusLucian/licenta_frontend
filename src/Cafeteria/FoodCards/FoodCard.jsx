import React from "react";
import { useTranslation } from 'react-i18next';
import { FaShoppingCart, FaExclamationTriangle } from "react-icons/fa";

const ALLERGENS = [
    { id: "gluten", name: "allergens.gluten", emoji: "🌾" },
    { id: "nuts", name: "allergens.nuts", emoji: "🥜" },
    { id: "dairy", name: "allergens.dairy", emoji: "🧀" },
    { id: "eggs", name: "allergens.eggs", emoji: "🥚" },
    { id: "seafood", name: "allergens.seafood", emoji: "🦐" },
    { id: "soy", name: "allergens.soy", emoji: "🌱" },
];

const FoodCard = ({ name, description, price, quantity, imageUrl, allergens, onBuy }) => {
    const { t } = useTranslation();
    const imageSrc = imageUrl?.startsWith("/images/")
        ? `http://localhost:8080${imageUrl}`
        : imageUrl;

    // Preis und Menge in Zahlen konvertieren und Standardwerte bereitstellen
    const numericPrice = typeof price === 'string' ? parseFloat(price) || 0 : (price || 0);
    const numericQuantity = typeof quantity === 'string' ? parseInt(quantity) || 0 : (quantity || 0);
    
    const isLowStock = numericQuantity > 0 && numericQuantity <= 5;

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
            {/* Bildcontainer mit Preisschild */}
            <div className="relative w-full h-48 overflow-hidden">
                {/* Bild */}
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={name || t('foodCard.defaultName')}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-4xl">🍽️</span>
                    </div>
                )}
                
                {/* Preisschild */}
                <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full font-bold shadow-md">
                    ${numericPrice.toFixed(2)}
                </div>
                
                {/* Lagerstatus */}
                {isLowStock && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-md">
                        <FaExclamationTriangle className="mr-1" /> {t('foodCard.stock.low')}
                    </div>
                )}
                
                {/* Nicht verfügbar Überlagerung */}
                {numericQuantity <= 0 && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold transform rotate-12 shadow-lg">
                            {t('foodCard.stock.out')}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Inhalt */}
            <div className="p-4 flex-grow flex flex-col">
                {/* Titel und Beschreibung */}
                <div className="mb-3 flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{name || t('foodCard.defaultName')}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{description || t('foodCard.noDescription')}</p>
                </div>
                
                {/* Lagerbestandsindikator */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">{t('foodCard.availability')}:</span>
                        <span className="text-xs font-bold">{numericQuantity} {t('foodCard.remaining')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                            className={`h-1.5 rounded-full ${
                                numericQuantity === 0 ? 'bg-red-500' : 
                                numericQuantity <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${Math.min(100, (numericQuantity / 20) * 100)}%` }}
                        ></div>
                    </div>
                </div>
                
                {/* Allergene */}
                {allergens && allergens.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs text-gray-500 mb-1">{t('foodCard.allergens')}:</h4>
                        <div className="flex flex-wrap gap-1">
                            {allergens.map((allergenId) => {
                                const allergen = ALLERGENS.find((a) => a.id === allergenId);
                                return allergen ? (
                                    <span
                                        key={allergen.id}
                                        className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs flex items-center"
                                        title={t(allergen.name)}
                                    >
                                        {allergen.emoji} <span className="ml-1 hidden sm:inline">{t(allergen.name)}</span>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}
                
                {/* Kaufen-Schaltfläche */}
                {onBuy && (
                    <button
                        onClick={onBuy}
                        disabled={numericQuantity <= 0}
                        className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
                            numericQuantity > 0
                                ? "bg-primary text-white hover:bg-secondary"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        <FaShoppingCart className="mr-2" />
                        {numericQuantity > 0 ? t('foodCard.addToCart') : t('foodCard.stock.out')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FoodCard;