import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditMenuItem = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { id } = useParams(); // Menüartikel-ID aus URL-Parametern abrufen

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        file: null,
        allergens: [],
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const [originalItem, setOriginalItem] = useState(null);

    useEffect(() => {
        // Menüartikeldaten beim Laden der Komponente abrufen
        fetchMenuItem();
    }, [id]);

    const fetchMenuItem = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/menu/${id}`);
            const item = response.data;

            // Allergene verarbeiten - sicherstellen, dass sie im richtigen Format sind
            let processedAllergens = [];
            if (item.allergens && Array.isArray(item.allergens)) {
                processedAllergens = item.allergens.map(allergen => {
                    if (typeof allergen === 'object' && allergen.id) {
                        return allergen.id;
                    }
                    return allergen;
                }).filter(Boolean);
            }

            setFormData({
                name: item.name || "",
                description: item.description || "",
                price: item.price || "",
                quantity: item.quantity || "",
                file: null,
                allergens: processedAllergens,
            });

            setOriginalItem(item);

            // Vorschaubild setzen, falls verfügbar
            if (item.imageUrl) {
                setPreviewImage(`http://localhost:8080${item.imageUrl}`);
            }
        } catch (error) {
            console.error("Error fetching menu item:", error);
            showNotification(
                t('chef.editFood.errors.loadFailed'),
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Fehler für dieses Feld löschen, falls vorhanden
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        // Dateityp und -größe validieren
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!validTypes.includes(file.type)) {
                setErrors({ ...errors, file: t('chef.editFood.errors.invalidFileType') });
                return;
            }
            
            if (file.size > maxSize) {
                setErrors({ ...errors, file: t('chef.editFood.errors.fileTooLarge') });
                return;
            }
            
            setFormData({ ...formData, file });
            setPreviewImage(URL.createObjectURL(file));
            setErrors({ ...errors, file: null });
        } else {
            // Vorschau nicht löschen, wenn keine neue Datei ausgewählt wurde
            // Dies stellt sicher, dass wir das vorhandene Bild behalten
            setFormData({ ...formData, file: null });
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
            newErrors.name = t('chef.editFood.errors.nameRequired');
        }
        
        if (!formData.description.trim()) {
            newErrors.description = t('chef.editFood.errors.descriptionRequired');
        }
        
        if (!formData.price) {
            newErrors.price = t('chef.editFood.errors.priceRequired');
        } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = t('chef.editFood.errors.priceInvalid');
        }
        
        if (!formData.quantity) {
            newErrors.quantity = t('chef.editFood.errors.quantityRequired');
        } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
            newErrors.quantity = t('chef.editFood.errors.quantityInvalid');
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification(t('chef.editFood.errors.correctErrors'), "error");
            return;
        }
        
        setSaving(true);
        
        try {
            // Mit oder ohne neues Bild behandeln
            if (formData.file) {
                // Wenn wir eine neue Datei haben, zuerst hochladen
                const fileData = new FormData();
                fileData.append("file", formData.file);
                
                await axios.post(`/menu/${id}/upload-image`, fileData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }
            
            // Andere Menüartikeldaten aktualisieren
            const updatedData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                allergens: formData.allergens
            };
            
            await axios.put(`/menu/${id}`, updatedData);
            
            showNotification(t('chef.editFood.success'), "success");
            
            // Auf Benachrichtigung warten, bevor umgeleitet wird
            setTimeout(() => {
                navigate("/chef");
            }, 1500);
        } catch (error) {
            console.error("Error updating menu item:", error);
            showNotification(
                error.response?.data || t('chef.editFood.errors.updateFailed'),
                "error"
            );
        } finally {
            setSaving(false);
        }
    };
    
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCancel = () => {
        if (window.confirm(t('chef.editFood.cancelConfirm'))) {
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
            // Gleiche Validierung wie in handleFileChange verwenden
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!validTypes.includes(file.type)) {
                setErrors({ ...errors, file: t('chef.editFood.errors.invalidFileType') });
                return;
            }
            
            if (file.size > maxSize) {
                setErrors({ ...errors, file: t('chef.editFood.errors.fileTooLarge') });
                return;
            }
            
            setFormData({ ...formData, file });
            setPreviewImage(URL.createObjectURL(file));
            setErrors({ ...errors, file: null });
        }
    };

    // Ladezustand anzeigen
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-primary text-4xl mb-4" />
                    <p className="text-gray-700 text-lg">{t('chef.editFood.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header mit Zurück-Button */}
                <div className="relative flex justify-center items-center mb-6">
                    <button 
                        onClick={() => navigate("/chef")}
                        className="absolute left-0 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <FaArrowLeft className="text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{t('chef.editFood.title')}</h1>
                </div>
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <p className="text-gray-600">
                            {t('chef.editFood.subtitle')}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                        {/* Formular-Bereich */}
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        {t('chef.editFood.form.itemName')}
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
                                        placeholder={t('chef.editFood.form.itemNamePlaceholder')}
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
                                        {t('chef.editFood.form.description')}
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
                                        placeholder={t('chef.editFood.form.descriptionPlaceholder')}
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
                                            {t('chef.editFood.form.price')}
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
                                            {t('chef.editFood.form.quantity')}
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
                                            placeholder={t('chef.editFood.form.quantityPlaceholder')}
                                            min="0"
                                        />
                                        {errors.quantity && (
                                            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('chef.editFood.form.image')}
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
                                                    <span>{t('chef.editFood.form.uploadNewImage')}</span>
                                                    <input 
                                                        id="file-upload" 
                                                        name="file" 
                                                        type="file" 
                                                        className="sr-only" 
                                                        onChange={handleFileChange} 
                                                        accept="image/*"
                                                    />
                                                </label>
                                                <p className="pl-1">{t('chef.editFood.form.dragDrop')}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {t('chef.editFood.form.fileTypes')}
                                            </p>
                                        </div>
                                        {previewImage && (
                                            <div className="mt-3 flex justify-center">
                                                <span className="text-sm text-green-600">
                                                    {t('chef.editFood.form.imageSelected')} ✓
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
                                        {t('chef.editFood.form.allergens')}
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
                                        {t('chef.editFood.form.allergensHint')}
                                    </p>
                                </div>
                                
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium flex items-center"
                                    >
                                        <FaTimes className="mr-2" /> {t('chef.editFood.buttons.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-md shadow-sm font-medium flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <FaSpinner className="animate-spin mr-2" /> {t('chef.editFood.buttons.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="mr-2" /> {t('chef.editFood.buttons.save')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Vorschau-Bereich */}
                        <div className="hidden lg:block">
                            <div className="sticky top-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">{t('chef.editFood.preview.title')}</h3>
                                <div className="max-w-sm mx-auto">
                                    <FoodCard
                                        name={formData.name || t('chef.editFood.preview.defaultName')}
                                        description={formData.description || t('chef.editFood.preview.defaultDescription')}
                                        price={formData.price || "0.00"}
                                        quantity={formData.quantity || "0"}
                                        imageUrl={previewImage}
                                        allergens={formData.allergens}
                                        onBuy={null} // Sicherstellen, dass "Kaufen"-Button in der Vorschau nicht angezeigt wird
                                    />
                                </div>
                                <p className="mt-4 text-xs text-center text-gray-500">
                                    {t('chef.editFood.preview.hint')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Benachrichtigungs-Toast */}
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
            
            {/* Animationsstile */}
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

export default EditMenuItem;