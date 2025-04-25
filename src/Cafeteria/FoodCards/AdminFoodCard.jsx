import React from "react";
import { FaTrash, FaEdit, FaExclamationTriangle } from "react-icons/fa";

const ALLERGENS = [
    { id: "gluten", name: "Gluten", emoji: "🌾" },
    { id: "nuts", name: "Nuts", emoji: "🥜" },
    { id: "dairy", name: "Dairy", emoji: "🧀" },
    { id: "eggs", name: "Eggs", emoji: "🥚" },
    { id: "seafood", name: "Seafood", emoji: "🦐" },
    { id: "soy", name: "Soy", emoji: "🌱" },
];

const AdminFoodCard = ({ name, description, price, quantity, imageUrl, allergens, onDelete, onEdit }) => {
    const imageSrc = imageUrl?.startsWith("/images/")
        ? `http://localhost:8080${imageUrl}`
        : imageUrl;

    const isLowStock = quantity > 0 && quantity <= 5;
    const isOutOfStock = quantity <= 0;

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            {/* Admin Controls - Top Bar */}
            <div className="bg-gray-800 text-white px-3 py-2 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider">Admin View</span>
                <div className="flex gap-2">
                    {onEdit && (
                        <button 
                            onClick={onEdit} 
                            className="p-1 hover:bg-gray-700 rounded"
                            title="Edit item"
                        >
                            <FaEdit size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            onClick={onDelete} 
                            className="p-1 hover:bg-red-600 rounded"
                            title="Delete item"
                        >
                            <FaTrash size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Image Container with Price Badge */}
            <div className="relative w-full h-48 overflow-hidden">
                {/* Image */}
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={name || "Food Item"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400 text-4xl">🍽️</span>
                    </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute bottom-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-full font-bold shadow-md">
                    ${price?.toFixed(2) || "0.00"}
                </div>
                
                {/* Stock Status */}
                {isLowStock && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-md">
                        <FaExclamationTriangle className="mr-1" /> Low Stock
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-md">
                        <FaExclamationTriangle className="mr-1" /> Out of Stock
                    </div>
                )}
            </div>
            
            {/* Content */}
            <div className="p-4 flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{name || "Item Name"}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description || "No description available"}</p>
                
                {/* Details Table */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">Price:</div>
                        <div className="text-gray-800 font-semibold">${price?.toFixed(2) || "0.00"}</div>
                        
                        <div className="text-gray-500">Quantity:</div>
                        <div className={`font-semibold ${
                            isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                            {quantity || "0"}
                        </div>
                    </div>
                </div>
                
                {/* Stock Indicator */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">Inventory:</span>
                        <span className="text-xs font-bold">{quantity} units</span>
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
                
                {/* Allergens */}
                <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Allergens:</h4>
                    {allergens && allergens.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {allergens.map((allergenId) => {
                                const allergen = ALLERGENS.find((a) => a.id === allergenId);
                                return allergen ? (
                                    <span
                                        key={allergen.id}
                                        className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs flex items-center"
                                        title={allergen.name}
                                    >
                                        {allergen.emoji} <span className="ml-1">{allergen.name}</span>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-xs italic">No allergens specified</p>
                    )}
                </div>
            </div>
            
            {/* Admin Action Buttons */}
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
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        <FaTrash className="inline mr-1" size={14} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminFoodCard;