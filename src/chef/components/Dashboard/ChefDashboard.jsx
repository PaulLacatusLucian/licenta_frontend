import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "../../../axiosConfig.js";
import { useNavigate } from "react-router-dom";
import AdminFoodCard from "../../../Cafeteria/FoodCards/AdminFoodCard";

const AdminMenuList = () => {
    const [menuItems, setMenuItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("/menu/all")
            .then((response) => {
                const processedItems = response.data.map((item) => ({
                    ...item,
                    // Process allergens
                    allergens: item.allergens.map((a) => {
                        try {
                            return JSON.parse(a.replace(/\\/g, "").replace(/^\[|]$/g, ""));
                        } catch (error) {
                            console.error("Failed to parse allergen:", a, error);
                            return null;
                        }
                    }).filter(Boolean),
                }));
                setMenuItems(processedItems);
            })
            .catch((error) => console.error("Error fetching menu items:", error));
    }, []);

    const handleDelete = (menuItemId) => {
        if (!window.confirm("Are you sure you want to delete this item from the menu?")) {
            return;
        }

        axios
            .delete(`/menu/${menuItemId}`)
            .then(() => {
                setMenuItems(menuItems.filter((item) => item.id !== menuItemId));
                alert("Item deleted successfully.");
            })
            .catch((error) => {
                console.error("Error deleting item:", error);
                alert("Error deleting item.");
            });
    };

    const goToAddFood = () => {
        navigate("/add-food");
    };

    const handleLogout = () => {
        Cookies.remove("userId");
        Cookies.remove("isEmployee");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            <div className="flex justify-between w-full max-w-screen-lg mb-6">
                <h2 className="text-3xl font-semibold">Admin Menu</h2>
                <div className="flex gap-4">
                    <button
                        onClick={goToAddFood}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md shadow-md"
                    >
                        Add Food
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md shadow-md"
                    >
                        Logout
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-screen-lg">
                {menuItems.map((item) => (
                    <AdminFoodCard
                        key={item.id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                        quantity={item.quantity}
                        imageUrl={item.imageUrl}
                        allergens={item.allergens}
                        onDelete={() => handleDelete(item.id)} // Corect utilizat aici
                    />
                ))}
            </div>
        </div>
    );
};

export default AdminMenuList;
