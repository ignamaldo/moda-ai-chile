import React from 'react';
import { ShoppingBag, Trash2, Wand2 } from 'lucide-react';

const ProductCard = ({ product, onAddCart, isAdmin, onDelete, formatCLP }) => (
    <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border border-gray-100/50 flex flex-col h-full group overflow-hidden">
        <div className="relative h-80 overflow-hidden bg-gray-50">
            {/* Main Image (AI Editorial if exists, else Original) */}
            <img
                src={(product.aiImageUrl || product.imageUrl) || "https://via.placeholder.com/400x400?text=Sin+Imagen"}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${product.aiImageUrl ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-110'}`}
            />

            {/* Hover Image (Original if AI exists) */}
            {product.aiImageUrl && (
                <img
                    src={product.imageUrl}
                    alt={`${product.name} original`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
                />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/40 shadow-sm transition-all group-hover:bg-white/60">
                    <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">{product.category || 'Destacado'}</span>
                </div>
                {product.aiImageUrl && (
                    <div className="bg-purple-600/80 backdrop-blur-md px-3 py-1 rounded-2xl border border-purple-400/40 shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500">
                        <Sparkles size={10} className="text-white" />
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Editorial IA</span>
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

            {/* Tooltip on hover */}
            {product.aiImageUrl && (
                <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                        Vista: Producto Real
                    </span>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
