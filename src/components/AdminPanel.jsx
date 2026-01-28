import React, { useState, useRef } from 'react';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import {
    CheckCircle,
    X,
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
    Database,
    Wand2,
    Sparkles,
    Loader2,
    ArrowRight,
    Package,
    AlertCircle,
    Trash2,
    ShoppingBag
} from 'lucide-react';
import { GEMINI_API_KEY } from '../firebaseConfig';

const AdminPanel = ({ user, db, appId, products, onDelete, formatCLP }) => {
    const [activeTab, setActiveTab] = useState('Dashboard'); // 'Dashboard', 'Lista', 'Crear'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
    const [toasts, setToasts] = useState([]);

    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        cost: '',
        stock: '1',
        category: 'Ropa',
        description: '',
        image: null
    });

    const categories = ['Ropa', 'Accesorios', 'Zapatos', 'Carteras', 'Mochilas', 'Poleras', 'Polerones'];

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const compressImage = (file, maxWidth = 1024, maxHeight = 1024) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setNewProduct(prev => ({ ...prev, image: compressed }));
            } catch (err) {
                addToast("Error al procesar la imagen", "error");
            }
        }
    };

    const processAIGeneration = async (docId, productName, productDesc, base64Image) => {
        const apiKey = GEMINI_API_KEY;
        if (!apiKey || apiKey === "TU_GEMINI_API_KEY_AQUI") return;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const base64Data = base64Image.split(',')[1];
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', docId);

        // --- PHASE 1: MODEL PROMOTION ---
        const modelPrompt = `Actúa como un fotógrafo de alta costura.
  OBJETIVO: Crear una imagen publicitaria de nivel editorial donde una modelo de alta costura viste el artículo de moda adjunto para promocionarlo.
  ARTÍCULO: ${productName} - ${productDesc}.
  ESTÉTICA: Iluminación chiaroscuro, entorno minimalista sofisticado, fotorrealismo extremo, estilo Vogue.`;

        try {
            const resModel = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: modelPrompt },
                            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                        ]
                    }]
                })
            });

            if (resModel.ok) {
                const data = await resModel.json();
                const aiBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (aiBase64) {
                    await updateDoc(docRef, { aiImageUrl: `data:image/jpeg;base64,${aiBase64}` });
                    addToast(`Diseño con Modelo listo para "${productName}" 👗`);
                }
            }
        } catch (e) { console.error("Model AI Error:", e); }

        // --- PHASE 2: PRODUCT ONLY (HIGH QUALITY) ---
        const productPrompt = `OBJETIVO: Crear una fotografía profesional del producto solo, sin modelos ni personas.
  ESCENA: El producto está perfectamente dispuesto sobre una mesa de mármol o madera minimalista en un estudio fotográfico.
  CALIDAD: Enfoque macro en texturas, visualización de alta calidad, iluminación de producto comercial nítida. 
  ARTÍCULO: ${productName}.`;

        try {
            const resProd = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: productPrompt },
                            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                        ]
                    }]
                })
            });

            if (resProd.ok) {
                const data = await resProd.json();
                const aiBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (aiBase64) {
                    await updateDoc(docRef, { aiProductUrl: `data:image/jpeg;base64,${aiBase64}` });
                    addToast(`Foto de Producto (Alta Calidad) lista para "${productName}" 📸`);
                }
            }
        } catch (e) { console.error("Product AI Error:", e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !newProduct.image) return;
        setIsSubmitting(true);
        try {
            const productData = {
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                cost: parseFloat(newProduct.cost || 0),
                stock: parseInt(newProduct.stock || 0),
                category: newProduct.category,
                description: newProduct.description,
                imageUrl: newProduct.image,
                aiImageUrl: null,
                aiProductUrl: null,
                createdAt: serverTimestamp(),
                createdBy: user.uid
            };

            const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData);

            addToast("Producto publicado con éxito 🚀");
            processAIGeneration(docRef.id, newProduct.name, newProduct.description, newProduct.image);

            setNewProduct({ name: '', price: '', cost: '', stock: '1', category: 'Ropa', description: '', image: null });
            setActiveTab('Lista');
        } catch (error) {
            console.error(error);
            addToast("Error al publicar producto", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateDemoData = async () => {
        if (!user) return;
        setIsGeneratingDemo(true);
        try {
            const demoProducts = [
                { name: "Abrigo Velvet Night", price: 125000, cost: 55000, stock: 12, category: "Ropa", description: "Terciopelo negro con forro de seda.", imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800" },
                { name: "Bolso Minimal Ivory", price: 89000, cost: 32000, stock: 8, category: "Carteras", description: "Cuero vegano color marfil.", imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800" },
                { name: "Botín Urban Craft", price: 95000, cost: 41000, stock: 15, category: "Zapatos", description: "Cuero genuino hecho a mano.", imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800" }
            ];

            for (const prod of demoProducts) {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
                    ...prod,
                    aiImageUrl: null,
                    aiProductUrl: null,
                    createdAt: serverTimestamp(),
                    createdBy: user.uid
                });
            }
            addToast("Datos demo generados correctamente");
        } catch (error) {
            console.error(error);
            addToast("Error al generar datos demo", "error");
        } finally {
            setIsGeneratingDemo(false);
        }
    };

    return (
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#F8F9FC] relative">
            {/* Toast System */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-right-10 duration-500 ${toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' : 'bg-white/90 border-gray-100 text-gray-800'
                            }`}
                    >
                        {toast.type === 'error' ? <AlertCircle size={20} className="text-red-500" /> : <CheckCircle size={20} className="text-purple-500" />}
                        <span className="font-bold text-sm">{toast.message}</span>
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">MODA AI ERP</h1>
                        <p className="text-gray-500 font-medium">Gestión inteligente de inventario y marketing IA</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                        {['Dashboard', 'Lista', 'Crear'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === tab
                                    ? 'bg-gray-900 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </header>

                {activeTab === 'Dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Total Productos</span>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black text-gray-900 tracking-tighter">{products.length}</span>
                                <Package className="text-purple-500 mb-2" size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Valor Inventario</span>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                    {formatCLP(products.reduce((acc, p) => acc + (p.price * (p.stock || 1)), 0))}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Stock Crítico</span>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black text-red-500 tracking-tighter">
                                    {products.filter(p => (p.stock || 0) < 5).length}
                                </span>
                                <AlertCircle className="text-red-500 mb-2" size={24} />
                            </div>
                        </div>
                        <button
                            onClick={handleGenerateDemoData}
                            disabled={isGeneratingDemo}
                            className="bg-purple-600 p-8 rounded-[2.5rem] shadow-lg shadow-purple-200 text-left hover:bg-purple-700 transition-all group overflow-hidden relative"
                        >
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest block mb-4">Herramientas</span>
                                <span className="text-2xl font-black text-white tracking-tighter leading-none block">
                                    {isGeneratingDemo ? 'Generando...' : 'Poblar Datos Demo'}
                                </span>
                            </div>
                            <Sparkles className="absolute -bottom-4 -right-4 text-purple-400/30 group-hover:scale-150 transition-transform duration-700" size={120} />
                        </button>
                    </div>
                )}

                {activeTab === 'Lista' && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Costo</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Venta</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Marketing IA</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-8 py-20 text-center text-gray-300 font-medium">No hay productos en inventario</td>
                                        </tr>
                                    ) : (
                                        products.map((p) => (
                                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                                                        <span className="font-bold text-gray-900">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">{p.category}</span>
                                                </td>
                                                <td className="px-8 py-6 font-medium text-gray-500">{formatCLP(p.cost || 0)}</td>
                                                <td className="px-8 py-6 font-black text-gray-900">{formatCLP(p.price)}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`font-black ${(p.stock || 0) < 5 ? 'text-red-500' : 'text-gray-900'}`}>
                                                        {p.stock || 0} u.
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex gap-2">
                                                        {p.aiImageUrl ? (
                                                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600" title="Modelo IA lista">
                                                                <CheckCircle size={14} />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 animate-pulse" title="Generando...">
                                                                <Sparkles size={14} />
                                                            </div>
                                                        )}
                                                        {p.aiProductUrl && (
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600" title="Foto Producto IA lista">
                                                                <CheckCircle size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => onDelete(p.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Crear' && (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <section className="space-y-8">
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Producto</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Abrigo Velvet Night"
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500/20 font-medium transition-all"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Venta</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500/20 font-black transition-all"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Costo Interno</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500/20 font-black transition-all"
                                            value={newProduct.cost}
                                            onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidades (Stock)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500/20 font-black transition-all"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
                                        <select
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500/20 font-black transition-all appearance-none"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción del Producto</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="Describe materiales, tallas y estilo..."
                                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-purple-500/20 font-medium transition-all"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 px-1">La IA utilizará esta descripción para generar la sesión editorial automáticamente.</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] relative group overflow-hidden transition-all hover:border-purple-200">
                                {newProduct.image ? (
                                    <>
                                        <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover rounded-2xl absolute inset-0" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                            <label className="cursor-pointer bg-white text-gray-900 px-6 py-3 rounded-xl font-black text-sm shadow-xl">Cambiar Foto</label>
                                        </div>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-4 group/label">
                                        <div className="p-6 bg-gray-50 rounded-[2rem] group-hover/label:bg-purple-50 transition-colors">
                                            <ImageIcon size={48} className="text-gray-300 group-hover/label:text-purple-400 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-gray-900 tracking-tighter uppercase text-sm">Cargar Foto del Producto</p>
                                            <p className="text-[10px] text-gray-400 font-medium">La IA generará la sesión editorial automáticamente al publicar.</p>
                                        </div>
                                    </label>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !newProduct.image}
                                className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 ${newProduct.image
                                    ? 'bg-gray-900 text-white shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-95'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <span>{isSubmitting ? 'Publicando...' : 'Publicar Producto'}</span>
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                            </button>
                        </section>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
