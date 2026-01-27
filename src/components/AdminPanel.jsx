import React, { useState, useRef } from 'react';
import { Edit, Plus, Image as ImageIcon } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const AdminPanel = ({ user, db, appId }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Ropa');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Check size (Firestore limit 1MB, let's limit to 700kb for safety)
            if (file.size > 700000) {
                alert("La imagen es muy grande. Por favor usa una imagen menor a 700KB para este demo.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImageFile(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
                name,
                price: Number(price),
                category,
                description,
                imageUrl: imageFile || "https://via.placeholder.com/400x400?text=Sin+Imagen",
                createdAt: serverTimestamp(),
                createdBy: user.uid
            });

            // Reset form
            setName('');
            setPrice('');
            setDescription('');
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            alert("Producto agregado correctamente.");
        } catch (error) {
            console.error("Error adding product: ", error);
            alert("Error al agregar producto. Revisa los permisos de Firebase.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Edit size={20} /> Administrar Tienda
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            placeholder="Ej: Chaqueta de Cuero Vintage"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CLP)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    required
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full pl-6 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    placeholder="9990"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                            >
                                <option>Ropa</option>
                                <option>Carteras</option>
                                <option>Gorros</option>
                                <option>Zapatos</option>
                                <option>Accesorios</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none h-24 resize-none"
                            placeholder="Detalles del material, talla, estilo..."
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto del Producto</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative h-48">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {imageFile ? (
                                <img src={imageFile} alt="Preview" className="h-full object-contain" />
                            ) : (
                                <>
                                    <ImageIcon size={32} className="text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Haz clic para subir imagen</p>
                                    <p className="text-xs text-gray-400 mt-1">Máx 700KB (Requerido para IA)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-auto shadow-lg"
                    >
                        {isSubmitting ? 'Guardando...' : 'Publicar Producto'} <Plus size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPanel;
