import React, { useState, useRef } from 'react';
import {
    Edit,
    Plus,
    Image as ImageIcon,
    LayoutGrid,
    DollarSign,
    Calendar,
    Users,
    BarChart3,
    Calculator,
    List,
    Database
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const AdminPanel = ({ user, db, appId, products, onDelete, formatCLP }) => {
    const [activeTab, setActiveTab] = useState('Inventario');
    const [subTab, setSubTab] = useState('Lista'); // 'Lista' o 'Crear'

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Ropa');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const tabs = [
        { id: 'Inventario', icon: LayoutGrid },
        { id: 'Costos', icon: DollarSign },
        { id: 'Reservas', icon: Calendar },
        { id: 'Clientes', icon: Users },
        { id: 'Estadísticas', icon: BarChart3 },
        { id: 'Impuestos', icon: Calculator },
    ];

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 800000) {
                alert("La imagen excede los 800KB. Optimizada para demo.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setImageFile(reader.result);
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
            setName(''); setPrice(''); setDescription(''); setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            alert("Producto publicado con éxito.");
            setSubTab('Lista');
        } catch (error) {
            console.error(error);
            alert("Error al publicar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#FBFCFE] min-h-[600px] rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col font-sans mb-20 animate-in fade-in zoom-in duration-500">
            {/* ERP Navigation Header */}
            <div className="bg-white border-b border-gray-100 px-8 py-2 overflow-x-auto">
                <div className="flex items-center gap-8 min-w-max">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 py-4 px-2 border-b-2 transition-all duration-300 ${isActive
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[13px] tracking-tight ${isActive ? 'font-black' : 'font-medium'}`}>
                                    {tab.id}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sub-navigation (Only for Inventario) */}
            <div className="px-8 py-6 bg-white border-b border-gray-50 flex items-center justify-between">
                <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
                    <button
                        onClick={() => setSubTab('Crear')}
                        className={`px-6 py-2 rounded-[0.9rem] text-[13px] font-bold flex items-center gap-2 transition-all ${subTab === 'Crear' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Plus size={16} /> Crear
                    </button>
                    <button
                        onClick={() => setSubTab('Lista')}
                        className={`px-6 py-2 rounded-[0.9rem] text-[13px] font-bold flex items-center gap-2 transition-all ${subTab === 'Lista' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List size={16} /> Lista
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                        <Database size={14} />
                        Demo Mode
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'Inventario' ? (
                    subTab === 'Lista' ? (
                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Producto</th>
                                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Stock</th>
                                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Precio</th>
                                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-gray-300 font-medium">No hay productos en inventario</td>
                                        </tr>
                                    ) : (
                                        products.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <img src={product.imageUrl} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900">{product.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium">{product.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[11px] font-black">En Stock</span>
                                                </td>
                                                <td className="px-8 py-5 font-bold text-sm">{formatCLP(product.price)}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => onDelete(product.id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                                    >
                                                        <Plus size={18} className="rotate-45" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Form View (Crear) */
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto py-4">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Nombre</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-bold text-gray-700" placeholder="Nombre de la pieza..." />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Precio</label>
                                        <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-bold text-gray-700" placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Categoría</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-bold text-gray-700 appearance-none">
                                            <option>Ropa</option>
                                            <option>Accesorios</option>
                                            <option>Zapatos</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Descripción</label>
                                    <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-medium text-gray-600 h-32 resize-none" placeholder="Detalles de materiales y estilo..." />
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Imagen del Producto</label>
                                <div className="flex-1 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 flex flex-col items-center justify-center relative p-8 group hover:border-purple-200 hover:bg-purple-50/20 transition-all">
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    {imageFile ? (
                                        <img src={imageFile} className="max-h-64 rounded-2xl shadow-xl" />
                                    ) : (
                                        <div className="text-center">
                                            <div className="bg-white p-5 rounded-3xl shadow-sm inline-block mb-4"><ImageIcon className="text-purple-400" size={32} /></div>
                                            <p className="font-bold text-sm text-gray-800">Sube una foto real</p>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Necesario para IA Studio</p>
                                        </div>
                                    )}
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-200">
                                    {isSubmitting ? 'Publicando...' : 'Publicar en Inventario'}
                                </button>
                            </div>
                        </form>
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in slide-in-from-bottom-5">
                        <div className="bg-gray-100 p-8 rounded-full mb-6">
                            <Database size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Módulo en Desarrollo</h3>
                        <p className="text-gray-400 mt-2 max-w-sm font-medium">Esta sección del ERP ({activeTab}) estará disponible en la siguiente actualización.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
