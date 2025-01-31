import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "../axiosConfig";
import FoodCard from "../Cafeteria/FoodCards/FoodCard";
import PurchaseModal from "./PurchaseModal";
import Navbar from "./Navbar/Navbar";

const MenuList = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        axios
            .get("/menu/all")
            .then((response) => {
                const processedItems = response.data.map((item) => ({
                    ...item,
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
                setFilteredItems(processedItems);
            })
            .catch((error) => console.error("Error fetching menu items:", error));
    }, []);

    useEffect(() => {
        filterItems();
    }, [searchTerm, selectedAllergens]);

    const filterItems = () => {
        const filtered = menuItems.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAllergens =
                selectedAllergens.length === 0 ||
                selectedAllergens.every((allergen) => item.allergens.includes(allergen));
            return matchesSearch && matchesAllergens;
        });
        setFilteredItems(filtered);
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
        const parentId = Cookies.get("userId");  // ID-ul părintelui (din cookies)
        const studentId = Cookies.get("studentId");  // ID-ul elevului (din cookies)
    
        if (!parentId || !studentId) {
            alert("Error: Parent or student ID is missing!");
            return;
        }
    
        try {
            await axios.post(`/menu/${menuItemId}/purchase`, null, {
                params: { parentId, studentId, quantity },
            });
    
            alert("Purchase successful!");
        } catch (error) {
            console.error("Error purchasing item:", error);
            alert(`Error purchasing item: ${error.response?.data || error.message}`);
        }
    };
    
    

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedAllergens={selectedAllergens}
                setSelectedAllergens={setSelectedAllergens}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 max-w-screen-lg mx-auto">
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
            <PurchaseModal
                isOpen={isModalOpen}
                onClose={closeModal}
                item={selectedItem}
                onPurchase={handlePurchase}
            />
        </div>
    );
};

export default MenuList;
