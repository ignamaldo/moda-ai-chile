import React from 'react';
import { ShoppingBag, Trash2, Wand2 } from 'lucide-react';

const ProductCard = ({ product, onAddCart, onTryOn, isAdmin, onDelete, formatCLP }) => (
    <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border border-gray-100/50 flex flex-col h-full group overflow-hidden">
        <div className="relative h-80 overflow-hidden bg-gray-50">
            <img
                src={product.imageUrl || "https://via.placeholder.com/400x400?text=Sin+Imagen"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />

            {/* Glassmorphism Category Badge */}
            <div className="absolute top-4 left-4 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/40 shadow-sm transition-all group-hover:bg-white/60">
                <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">{product.category || 'Destacado'}</span>
            </div>

            {isAdmin && (
                <button
                    onClick={() => onDelete(product.id)}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-red-500 text-gray-800 hover:text-white p-2.5 rounded-2xl shadow-lg backdrop-blur-md border border-white/40 transition-all duration-300"
                >
                    <Trash2 size={16} />
                </button>
            )}

            {/* AI Try-on Button with custom gradient */}
            <button
                onClick={() => onTryOn(product)}
                className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur-md text-white px-5 py-3.5 rounded-[1.25rem] text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10"
            >
                <div className="bg-white/20 p-1 rounded-lg">
                    <Wand2 size={14} className="animate-pulse" />
                </div>
                Probar con IA
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

export default ProductCard;
