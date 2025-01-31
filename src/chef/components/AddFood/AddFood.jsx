import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../axiosConfig";
import FoodCard from "../../../Cafeteria/FoodCards/FoodCard";

const ALLERGENS = [
    { id: "gluten", name: "Gluten", emoji: "🌾" },
    { id: "nuts", name: "Nuts", emoji: "🥜" },
    { id: "dairy", name: "Dairy", emoji: "🧀" },
    { id: "eggs", name: "Eggs", emoji: "🥚" },
    { id: "seafood", name: "Seafood", emoji: "🦐" },
    { id: "soy", name: "Soy", emoji: "🌱" },
];

const AddMenuItem = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        file: null,
        allergens: [],
    });
    const [previewImage, setPreviewImage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, file });
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setPreviewImage(null);
        }
    };

    const toggleAllergen = (allergen) => {
        setFormData((prevState) => {
            const allergens = [...prevState.allergens];
            if (allergens.includes(allergen)) {
                return {
                    ...prevState,
                    allergens: allergens.filter((a) => a !== allergen),
                };
            } else {
                return {
                    ...prevState,
                    allergens: [...allergens, allergen],
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("price", formData.price);
        data.append("quantity", formData.quantity);
        data.append("allergens", JSON.stringify(formData.allergens));
        if (formData.file) {
            data.append("file", formData.file);
        }

        try {
            await axios.post("/menu/add", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Menu item added successfully!");
            navigate("/chef");
        } catch (error) {
            console.error("Error adding menu item:", error);
            alert("Failed to add menu item.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start w-full max-w-5xl gap-8 p-8 bg-white rounded-lg shadow-md">
                {/* Form Section */}
                <div className="flex-1 max-w-lg">
                    <h1 className="text-3xl font-semibold mb-4 text-primary">
                        Add Menu Item
                    </h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-primary rounded-md shadow-md bg-forth"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-primary rounded-md shadow-md bg-forth"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Price (in $)
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-primary rounded-md shadow-md bg-forth"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="quantity"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Quantity
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="mt-1 p-2 block w-full border border-primary rounded-md shadow-md bg-forth"
                                min="1"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="file"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Image
                            </label>
                            <input
                                type="file"
                                id="file"
                                name="file"
                                onChange={handleFileChange}
                                className="mt-1 p-2 block w-full border border-primary rounded-md shadow-md bg-forth"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Allergens
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ALLERGENS.map((allergen) => (
                                    <button
                                        type="button"
                                        key={allergen.id}
                                        onClick={() => toggleAllergen(allergen.id)}
                                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                                            formData.allergens.includes(allergen.id)
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 text-black"
                                        }`}
                                    >
                                        {allergen.emoji} {allergen.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md shadow-md"
                        >
                            Add Item
                        </button>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="flex-1 flex justify-center items-center">
                    <div className="w-full max-w-sm">
                        <FoodCard
                            name={formData.name}
                            description={formData.description}
                            price={formData.price}
                            quantity={formData.quantity}
                            imageUrl={previewImage}
                            allergens={formData.allergens}
                            onBuy={null} // Ensure "Buy" button does not appear in the preview
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMenuItem;
