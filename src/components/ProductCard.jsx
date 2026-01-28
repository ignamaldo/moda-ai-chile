import React from 'react';
import { ShoppingBag, Trash2, Sparkles, ImageIcon } from 'lucide-react';

const ProductCard = ({ product, onAddCart, isAdmin, onDelete, formatCLP }) => {
    const [view, setView] = React.useState('aiModel'); // 'aiModel', 'aiProduct', 'original'

    const getImageUrl = () => {
        if (view === 'aiModel') return product.aiImageUrl || product.imageUrl;
        if (view === 'aiProduct') return product.aiProductUrl || product.imageUrl;
        return product.imageUrl;
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border border-gray-100/50 flex flex-col h-full group overflow-hidden">
            <div className="relative h-80 overflow-hidden bg-gray-50">
                {/* Main Image Display */}
                <img
                    src={getImageUrl() || "https://via.placeholder.com/400x400?text=Sin+Imagen"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />

                {/* View Selector (Glassmorphism Buttons) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-md p-1 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); setView('aiModel'); }}
                        className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${view === 'aiModel' ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    >
                        Modelo IA
                    </button>
                    {product.aiProductUrl && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setView('aiProduct'); }}
                            className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${view === 'aiProduct' ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            Producto IA
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); setView('original'); }}
                        className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${view === 'original' ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    >
                        Real
                    </button>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/40 shadow-sm transition-all group-hover:bg-white/60">
                        <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">{product.category || 'Destacado'}</span>
                    </div>
                    {product.aiImageUrl && view === 'aiModel' && (
                        <div className="bg-purple-600/80 backdrop-blur-md px-3 py-1 rounded-2xl border border-purple-400/40 shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500">
                            <Sparkles size={10} className="text-white" />
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">Promoción IA</span>
                        </div>
                    )}
                    {product.aiProductUrl && view === 'aiProduct' && (
                        <div className="bg-indigo-600/80 backdrop-blur-md px-3 py-1 rounded-2xl border border-indigo-400/40 shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500">
                            <ImageIcon size={10} className="text-white" />
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">Detalle Premium</span>
                        </div>
                    )}
                </div>

                {isAdmin && (
                    <button
                        onClick={() => onDelete(product.id)}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-red-500 text-gray-800 hover:text-white p-2.5 rounded-2xl shadow-lg backdrop-blur-md border border-white/40 transition-all duration-300 z-20"
                    >
                        <Trash2 size={16} />
                    </button>
                )}

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="p-6 flex flex-col flex-grow bg-white relative">
                <div className="mb-4">
                    <h3 className="font-black text-gray-900 text-xl leading-tight mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors duration-300">{product.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Inversión</span>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter">{formatCLP(product.price)}</span>
                    </div>
                    <button
                        onClick={() => onAddCart(product)}
                        className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-purple-600 hover:scale-110 active:scale-95 transition-all duration-500 shadow-xl shadow-gray-200 group/btn"
                        title="Añadir al carrito"
                    >
                        <ShoppingBag size={20} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};


export default ProductCard;
