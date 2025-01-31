import React from "react";

const ALLERGENS = [
    { id: "gluten", name: "Gluten", emoji: "🌾" },
    { id: "nuts", name: "Nuts", emoji: "🥜" },
    { id: "dairy", name: "Dairy", emoji: "🧀" },
    { id: "eggs", name: "Eggs", emoji: "🥚" },
    { id: "seafood", name: "Seafood", emoji: "🦐" },
    { id: "soy", name: "Soy", emoji: "🌱" },
];

const AdminFoodCard = ({ name, description, price, quantity, imageUrl, allergens, onDelete }) => {
    const imageSrc = imageUrl?.startsWith("/images/")
        ? `http://localhost:8080${imageUrl}`
        : imageUrl;

    return (
        <div className="border p-4 rounded-md shadow-md w-full max-w-xs">
            <div className="w-full h-48 overflow-hidden rounded-md bg-gray-200">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={name || "Item Image"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <p className="text-center text-gray-500 h-full flex items-center justify-center">
                        No Image
                    </p>
                )}
            </div>
            <h3 className="text-xl font-bold mt-4">{name || "Item Name"}</h3>
            <p className="text-gray-700">{description || "Item Description"}</p>
            <p className="mt-2">
                <span className="font-bold">Price:</span> ${price || "0.00"}
            </p>
            <p>
                <span className="font-bold">Quantity:</span> {quantity || "0"}
            </p>
            <div className="mt-2">
                <p className="font-bold">Allergens:</p>
                {allergens && allergens.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {allergens.map((allergenId) => {
                            const allergen = ALLERGENS.find((a) => a.id === allergenId);
                            return allergen ? (
                                <span
                                    key={allergen.id}
                                    className="bg-gray-200 rounded-full px-2 py-1 text-sm flex items-center gap-1"
                                >
                                    {allergen.emoji} {allergen.name}
                                </span>
                            ) : null;
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">No allergens specified</p>
                )}
            </div>
            {onDelete && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={onDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md shadow-md"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminFoodCard;
