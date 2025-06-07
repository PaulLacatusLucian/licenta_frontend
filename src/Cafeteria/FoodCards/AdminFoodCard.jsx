import React from "react";
import { useTranslation } from 'react-i18next';
import { FaTrash, FaEdit, FaExclamationTriangle } from "react-icons/fa";

const ALLERGENS = [
    { id: "gluten", name: "allergens.gluten", emoji: "🌾" },
    { id: "nuts", name: "allergens.nuts", emoji: "🥜" },
    { id: "dairy", name: "allergens.dairy", emoji: "🧀" },
    { id: "eggs", name: "allergens.eggs", emoji: "🥚" },
    { id: "seafood", name: "allergens.seafood", emoji: "🦐" },
    { id: "soy", name: "allergens.soy", emoji: "🌱" },
];

const AdminFoodCard = ({ name, description, price, quantity, imageUrl, allergens, onDelete, onEdit }) => {
    const { t } = useTranslation();
    const imageSrc = imageUrl?.startsWith("/images/")
        ? `http://localhost:8080${imageUrl}`
        : imageUrl;

    const isLowStock = quantity > 0 && quantity <= 5;
    const isOutOfStock = quantity <= 0;

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            {/* Admin-Steuerungen - Obere Leiste */}
            <div className="bg-gray-800 text-white px-3 py-2 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider">{t('foodCard.admin.adminView')}</span>
                <div className="flex gap-2">
                    {onEdit && (
                        <button 
                            onClick={onEdit} 
                            className="p-1 hover:bg-gray-700 rounded"
                            title={t('foodCard.admin.editItem')}
                        >
                            <FaEdit size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            onClick={onDelete} 
                            className="p-1 hover:bg-red-600 rounded"
                            title={t('foodCard.admin.deleteItem')}
                        >
                            <FaTrash size={14} />
                        </button>
                    )}
                </div>
            </div>

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
                <div className="absolute bottom-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-full font-bold shadow-md">
                    ${price?.toFixed(2) || "0.00"}
                </div>
                
                {/* Lagerstatus */}
                {isLowStock && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-md">
                        <FaExclamationTriangle className="mr-1" /> {t('foodCard.stock.low')}
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-md">
                        <FaExclamationTriangle className="mr-1" /> {t('foodCard.stock.out')}
                    </div>
                )}
            </div>
            
            {/* Inhalt */}
            <div className="p-4 flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{name || t('foodCard.defaultName')}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description || t('foodCard.noDescription')}</p>
                
                {/* Details-Tabelle */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">{t('foodCard.admin.price')}:</div>
                        <div className="text-gray-800 font-semibold">${price?.toFixed(2) || "0.00"}</div>
                        
                        <div className="text-gray-500">{t('foodCard.admin.quantity')}:</div>
                        <div className={`font-semibold ${
                            isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                            {quantity || "0"}
                        </div>
                    </div>
                </div>
                
                {/* Lagerbestandsindikator */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">{t('foodCard.admin.inventory')}:</span>
                        <span className="text-xs font-bold">{quantity} {t('foodCard.admin.units')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                            className={`h-1.5 rounded-full ${
                                isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-yellow-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${Math.min(100, (quantity / 20) * 100)}%` }}
                        ></div>
                    </div>
                </div>
                
                {/* Allergene */}
                <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">{t('foodCard.allergens')}:</h4>
                    {allergens && allergens.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {allergens.map((allergenId) => {
                                const allergen = ALLERGENS.find((a) => a.id === allergenId);
                                return allergen ? (
                                    <span
                                        key={allergen.id}
                                        className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs flex items-center"
                                        title={t(allergen.name)}
                                    >
                                        {allergen.emoji} <span className="ml-1">{t(allergen.name)}</span>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-xs italic">{t('foodCard.noAllergens')}</p>
                    )}
                </div>
            </div>
            
            {/* Admin-Aktionsschaltflächen */}
            {onDelete && (
                <div className="bg-gray-100 px-4 py-3 flex justify-between">
                    <button 
                        onClick={onEdit || (() => {})}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                            onEdit ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!onEdit}
                    >
                        <FaEdit className="inline mr-1" size={14} />
                        {t('foodCard.admin.edit')}
                    </button>
                    <button
                        onClick={onDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        <FaTrash className="inline mr-1" size={14} />
                        {t('foodCard.admin.delete')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminFoodCard;