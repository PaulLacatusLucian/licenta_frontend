import React, { useState } from "react";

const PurchaseModal = ({ isOpen, onClose, item, onPurchase }) => {
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !item) return null;

    const handlePurchaseClick = () => {
        onPurchase(item.id, quantity);
        onClose();
    };

    const handleQuantityChange = (e) => {
        const value = Math.max(1, Math.min(parseInt(e.target.value, 10) || 1, item.quantity));
        setQuantity(value);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
                <h2 className="text-2xl font-bold mb-4">Purchase {item.name}</h2>
                <p className="text-gray-700 mb-4">{item.description}</p>
                <p className="font-bold mb-4">Price: ${item.price}</p>
                <p className="font-bold mb-4">Stock: {item.quantity}</p>
                <div className="mb-4">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity:
                    </label>
                    <input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="p-2 border border-gray-300 rounded-md w-full"
                        min="1"
                        max={item.quantity}
                    />
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={handlePurchaseClick}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md"
                    >
                        Confirm Purchase
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseModal;
