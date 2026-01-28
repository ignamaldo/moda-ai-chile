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
    Database,
    Wand2,
    Sparkles,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { GEMINI_API_KEY } from '../firebaseConfig';

const AdminPanel = ({ user, db, appId, products, onDelete, formatCLP }) => {
    const [activeTab, setActiveTab] = useState('Inventario');
    const [subTab, setSubTab] = useState('Lista'); // 'Lista' o 'Crear'

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Ropa');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [aiImageFile, setAiImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const fileInputRef = useRef(null);

    const tabs = [
        { id: 'Inventario', icon: LayoutGrid },
        { id: 'Costos', icon: DollarSign },
        { id: 'Reservas', icon: Calendar },
        { id: 'Clientes', icon: Users },
        { id: 'Estadísticas', icon: BarChart3 },
        { id: 'Impuestos', icon: Calculator },
    ];

    const compressImage = (base64Str, maxWidth = 1024, maxHeight = 1024) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
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
                resolve(canvas.toDataURL('image/jpeg', 0.8)); // Calidad un poco mayor para Gemini
            };
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result);
                setImageFile(compressed);
                setAiImageFile(null); // Reset AI image if original changes
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateAI = async () => {
        if (!imageFile || !description) {
            alert("Sube una foto y escribe una descripción primero.");
            return;
        }

        setIsGeneratingAI(true);
        const apiKey = GEMINI_API_KEY;

        if (!apiKey || apiKey === "TU_GEMINI_API_KEY_AQUI") {
            alert("Falta configurar la GEMINI_API_KEY en firebaseConfig.js");
            setIsGeneratingAI(false);
            return;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const base64Data = imageFile.split(',')[1];

        const prompt = `Actúa como un fotógrafo de alta costura para una revista de élite (como Vogue o Harper's Bazaar).
  OBJETIVO: Crear una imagen publicitaria de nivel editorial donde una modelo de alta costura viste el artículo de moda adjunto.
  
  ARTÍCULO A RESALTAR: ${name} - ${description}.
  
  DETALLES DE LA COMPOSICIÓN:
  - ESCENA: Un entorno minimalista y sofisticado (estudio profesional con iluminación 'chiaroscuro' o un fondo arquitectónico moderno y limpio).
  - MODELO: Una persona con pose elegante, natural y profesional que luzca la prenda con confianza.
  - ESTÉTICA: Fotografía nítida, de alto contraste, con texturas de tela realistas y detalles finos.
  - INTEGRACIÓN: La prenda de la imagen adjunta debe integrarse perfectamente en el cuerpo de la modelo, respetando la caída, el material y el color original.
  - CALIDAD: Resolución 4K, fotorrealismo extremo, sin distorsiones en manos o rostro.`;

        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                ]
            }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Gemini Error Detail:", errorData);
                throw new Error(errorData.error?.message || 'Error al conectar con la IA de Google');
            }

            const data = await response.json();
            const aiBase64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

            if (aiBase64) {
                setAiImageFile(`data:image/jpeg;base64,${aiBase64}`);
            } else {
                throw new Error("La IA no generó una imagen. Prueba con una descripción más corta.");
            }
        } catch (error) {
            console.error("Error IA:", error);
            alert(`Error IA: ${error.message}`);
        } finally {
            setIsGeneratingAI(false);
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
                imageUrl: imageFile || "",
                aiImageUrl: aiImageFile || null,
                createdAt: serverTimestamp(),
                createdBy: user.uid
            });
            setName(''); setPrice(''); setDescription(''); setImageFile(null); setAiImageFile(null);
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

    const handleGenerateDemoData = async () => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const demoProducts = [
                {
                    name: "Abrigo Camel Luxury",
                    price: 89990,
                    category: "Ropa",
                    description: "Abrigo de lana premium color camel, corte elegante.",
                    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=400&h=400&auto=format&fit=crop",
                    aiImageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=400&h=400&auto=format&fit=crop"
                },
                {
                    name: "Botas Cuero Italiano",
                    price: 125990,
                    category: "Zapatos",
                    description: "Botas de cuero genuino hechas a mano en Italia.",
                    imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=400&h=400&auto=format&fit=crop",
                    aiImageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=400&h=400&auto=format&fit=crop"
                }
            ];

            for (const prod of demoProducts) {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
                    ...prod,
                    createdAt: serverTimestamp(),
                    createdBy: user.uid
                });
            }

            alert("Datos demo generados con éxito.");
            setSubTab('Lista');
        } catch (error) {
            console.error(error);
            alert("Error al generar datos demo.");
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

            {/* Sub-navigation */}
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
                    <button
                        onClick={handleGenerateDemoData}
                        disabled={isSubmitting}
                        className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95 disabled:opacity-50"
                    >
                        <Database size={14} />
                        {isSubmitting ? 'Generando...' : 'Generar Datos Demo'}
                    </button>
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
                                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Estado IA</th>
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
                                                        <div className="relative">
                                                            <img src={product.imageUrl} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                                                            {product.aiImageUrl && <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-0.5 rounded-md border-2 border-white"><Sparkles size={8} /></div>}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900">{product.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium">{product.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    {product.aiImageUrl ? (
                                                        <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 w-max uppercase tracking-tighter">
                                                            Editorial IA <Sparkles size={10} />
                                                        </span>
                                                    ) : (
                                                        <span className="bg-gray-50 text-gray-400 px-3 py-1 rounded-full text-[11px] font-black w-max uppercase tracking-tighter">Original Only</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 font-bold text-sm text-gray-700">{formatCLP(product.price)}</td>
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
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto py-4">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Nombre del Producto</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-bold text-gray-700" placeholder="Ej: Abrigo Velvet Night" />
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
                                    <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Descripción para Editorial IA</label>
                                    <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-medium text-gray-600 h-28 resize-none" placeholder="Describe materiales y estilo para que la IA pose con este producto..." />
                                </div>

                                <div className="p-6 bg-purple-50/50 border border-purple-100 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wand2 className="text-purple-600" size={18} />
                                            <h4 className="font-black text-xs uppercase text-purple-900">AI Editorial Studio</h4>
                                        </div>
                                        {aiImageFile && <span className="text-[10px] font-black text-green-600 uppercase">Listo ✅</span>}
                                    </div>
                                    <p className="text-[11px] text-purple-700/70 font-medium">Automatiza tu sesión de fotos. La IA creará una modelo profesional luciendo tu prenda automáticamente.</p>
                                    <button
                                        type="button"
                                        onClick={handleGenerateAI}
                                        disabled={!imageFile || isGeneratingAI}
                                        className="w-full py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all disabled:opacity-30 active:scale-95 shadow-sm"
                                    >
                                        {isGeneratingAI ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                        {isGeneratingAI ? 'Fotografiando...' : (aiImageFile ? 'Regenerar Foto IA' : 'Generar Sesión Editorial IA')}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <label className="text-[11px] font-black uppercase text-gray-400 ml-1">Multimedia del Producto</label>
                                <div className="grid grid-cols-2 gap-4 h-full min-h-[300px]">
                                    <div className="border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 flex flex-col items-center justify-center relative group overflow-hidden">
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        {imageFile ? (
                                            <img src={imageFile} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <div className="text-center px-4">
                                                <ImageIcon className="text-gray-300 mx-auto mb-2" size={24} />
                                                <p className="font-bold text-[10px] text-gray-500 uppercase leading-tight">Cargar Foto<br />Original</p>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm">Producto</div>
                                    </div>

                                    <div className="border-2 border-dashed border-purple-100 rounded-[2rem] bg-purple-50/20 flex flex-col items-center justify-center relative overflow-hidden">
                                        {aiImageFile ? (
                                            <img src={aiImageFile} className="w-full h-full object-cover rounded-2xl animate-in zoom-in duration-500" />
                                        ) : (
                                            <div className="text-center px-4">
                                                <Wand2 className="text-purple-200 mx-auto mb-2" size={24} />
                                                <p className="font-bold text-[10px] text-purple-300 uppercase leading-tight">Resultado<br />IA Editorial</p>
                                            </div>
                                        )}
                                        {isGeneratingAI && (
                                            <div className="absolute inset-0 bg-purple-50/60 backdrop-blur-[1px] flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="animate-spin text-purple-600" size={24} />
                                                    <span className="text-[8px] font-black text-purple-600 uppercase animate-pulse">Generando...</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-1 shadow-lg shadow-purple-200">Editorial <Sparkles size={8} /></div>
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting || !imageFile} className="w-full bg-black text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 mt-auto flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50">
                                    {isSubmitting ? 'Publicando...' : <>Publicar Producto <ArrowRight size={18} /></>}
                                </button>
                            </div>
                        </form>
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <div className="bg-gray-100 p-8 rounded-full mb-6">
                            <Database size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Módulo en Desarrollo</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
