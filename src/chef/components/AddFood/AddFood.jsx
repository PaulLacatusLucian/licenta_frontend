import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "../../../axiosConfig";
import FoodCard from "../../../Cafeteria/FoodCards/FoodCard";
import { FaUpload, FaArrowLeft, FaSave, FaTimes, FaSpinner } from "react-icons/fa";

const ALLERGENS = [
    { id: "gluten", name: "allergens.gluten", emoji: "🌾" },
    { id: "nuts", name: "allergens.nuts", emoji: "🥜" },
    { id: "dairy", name: "allergens.dairy", emoji: "🧀" },
    { id: "eggs", name: "allergens.eggs", emoji: "🥚" },
    { id: "seafood", name: "allergens.seafood", emoji: "🦐" },
    { id: "soy", name: "allergens.soy", emoji: "🌱" },
];

const AddMenuItem = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        file: null,
        allergens: [],
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            const maxSize = 5 * 1024 * 1024;
            
            if (!validTypes.includes(file.type)) {
                setErrors({ ...errors, file: t('chef.addFood.errors.invalidFileType') });
                return;
            }
            
            if (file.size > maxSize) {
                setErrors({ ...errors, file: t('chef.addFood.errors.fileTooLarge') });
                return;
            }
            
            setFormData({ ...formData, file });
            setPreviewImage(URL.createObjectURL(file));
            setErrors({ ...errors, file: null });
        } else {
            setFormData({ ...formData, file: null });
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

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = t('chef.addFood.errors.nameRequired');
        }
        
        if (!formData.description.trim()) {
            newErrors.description = t('chef.addFood.errors.descriptionRequired');
        }
        
        if (!formData.price) {
            newErrors.price = t('chef.addFood.errors.priceRequired');
        } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = t('chef.addFood.errors.priceInvalid');
        }
        
        if (!formData.quantity) {
            newErrors.quantity = t('chef.addFood.errors.quantityRequired');
        } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
            newErrors.quantity = t('chef.addFood.errors.quantityInvalid');
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification(t('chef.addFood.errors.correctErrors'), "error");
            return;
        }
        
        setLoading(true);
        
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
            showNotification(t('chef.addFood.success'), "success");
            
            setTimeout(() => {
                navigate("/chef");
            }, 1500);
        } catch (error) {
            console.error("Error adding menu item:", error);
            showNotification(
                error.response?.data || t('chef.addFood.errors.addFailed'),
                "error"
            );
            setLoading(false);
        }
    };
    
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCancel = () => {
        if (window.confirm(t('chef.addFood.cancelConfirm'))) {
            navigate("/chef");
        }
    };
    
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            const maxSize = 5 * 1024 * 1024;
            
            if (!validTypes.includes(file.type)) {
                setErrors({ ...errors, file: t('chef.addFood.errors.invalidFileType') });
                return;
            }
            
            if (file.size > maxSize) {
                setErrors({ ...errors, file: t('chef.addFood.errors.fileTooLarge') });
                return;
            }
            
            setFormData({ ...formData, file });
            setPreviewImage(URL.createObjectURL(file));
            setErrors({ ...errors, file: null });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => navigate("/chef")}
                        className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <FaArrowLeft className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{t('chef.addFood.title')}</h1>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <p className="text-gray-600">
                            {t('chef.addFood.subtitle')}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        {t('chef.addFood.form.itemName')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`mt-1 p-2 block w-full border ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md focus:ring-primary focus:border-primary`}
                                        placeholder={t('chef.addFood.form.itemNamePlaceholder')}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>
                                
                                <div className="mb-4">
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        {t('chef.addFood.form.description')}
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className={`mt-1 p-2 block w-full border ${
                                            errors.description ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md focus:ring-primary focus:border-primary`}
                                        placeholder={t('chef.addFood.form.descriptionPlaceholder')}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            {t('chef.addFood.form.price')}
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className={`pl-7 p-2 block w-full border ${
                                                    errors.price ? 'border-red-500' : 'border-gray-300'
                                                } rounded-md focus:ring-primary focus:border-primary`}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label
                                            htmlFor="quantity"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            {t('chef.addFood.form.quantity')}
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className={`mt-1 p-2 block w-full border ${
                                                errors.quantity ? 'border-red-500' : 'border-gray-300'
                                            } rounded-md focus:ring-primary focus:border-primary`}
                                            placeholder={t('chef.addFood.form.quantityPlaceholder')}
                                            min="0"
                                        />
                                        {errors.quantity && (
                                            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('chef.addFood.form.image')}
                                    </label>
                                    <div 
                                        className={`mt-1 p-4 border-2 border-dashed rounded-md ${
                                            errors.file ? 'border-red-500' : 'border-gray-300'
                                        } hover:border-primary transition-colors cursor-pointer bg-gray-50`}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('file-upload').click()}
                                    >
                                        <div className="space-y-2 text-center">
                                            <FaUpload className="mx-auto h-10 w-10 text-gray-400" />
                                            <div className="text-sm text-gray-600">
                                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-secondary">
                                                    <span>{t('chef.addFood.form.uploadFile')}</span>
                                                    <input 
                                                        id="file-upload" 
                                                        name="file" 
                                                        type="file" 
                                                        className="sr-only" 
                                                        onChange={handleFileChange} 
                                                        accept="image/*"
                                                    />
                                                </label>
                                                <p className="pl-1">{t('chef.addFood.form.dragDrop')}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {t('chef.addFood.form.fileTypes')}
                                            </p>
                                        </div>
                                        {previewImage && (
                                            <div className="mt-3 flex justify-center">
                                                <span className="text-sm text-green-600">
                                                    {t('chef.addFood.form.imageSelected')} ✓
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {errors.file && (
                                        <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                                    )}
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('chef.addFood.form.allergens')}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ALLERGENS.map((allergen) => (
                                            <button
                                                type="button"
                                                key={allergen.id}
                                                onClick={() => toggleAllergen(allergen.id)}
                                                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors ${
                                                    formData.allergens.includes(allergen.id)
                                                        ? "bg-red-500 text-white shadow-sm"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                <span>{allergen.emoji}</span> 
                                                <span>{t(allergen.name)}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        {t('chef.addFood.form.allergensHint')}
                                    </p>
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium flex items-center"
                                    >
                                        <FaTimes className="mr-2" /> {t('chef.addFood.buttons.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-md shadow-sm font-medium flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" /> {t('chef.addFood.buttons.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="mr-2" /> {t('chef.addFood.buttons.save')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="hidden lg:block">
                            <div className="sticky top-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">{t('chef.addFood.preview.title')}</h3>
                                <div className="max-w-sm mx-auto">
                                    <FoodCard
                                        name={formData.name || t('chef.addFood.preview.defaultName')}
                                        description={formData.description || t('chef.addFood.preview.defaultDescription')}
                                        price={formData.price || "0.00"}
                                        quantity={formData.quantity || "0"}
                                        imageUrl={previewImage}
                                        allergens={formData.allergens}
                                        onBuy={null}
                                    />
                                </div>
                                <p className="mt-4 text-xs text-center text-gray-500">
                                    {t('chef.addFood.preview.hint')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {notification && (
                <div className={`fixed bottom-4 right-4 max-w-md z-50 rounded-lg shadow-lg p-4 flex items-start space-x-4 ${
                    notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                } animate-fade-in`}>
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        notification.type === "success" ? "bg-green-200" : "bg-red-200"
                    }`}>
                        {notification.type === "success" ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                            </svg>
                        )}
                    </div>
                    <div className="flex-1 pt-1">
                        <p className="text-sm font-medium">
                            {notification.message}
                        </p>
                    </div>
                    <button 
                        className="flex-shrink-0 ml-1 text-gray-400 hover:text-gray-600"
                        onClick={() => setNotification(null)}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            )}
            
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AddMenuItem;