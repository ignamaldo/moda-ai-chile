import React from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';

const ProductCard = ({ product, onAddCart, isAdmin, onDelete, formatCLP }) => {
    // For Admin: Show anything available
    // For Customer: Show ONLY AI. If no AI, show placeholder/loading.
    const primaryImage = isAdmin
        ? (product.aiImageUrl || product.aiProductUrl || product.imageUrl)
        : (product.aiImageUrl || product.aiProductUrl);

    const hoverImage = isAdmin
        ? (product.aiProductUrl || product.aiImageUrl || product.imageUrl)
        : (product.aiProductUrl || product.aiImageUrl);

    const hasAnyAI = product.aiImageUrl || product.aiProductUrl;
    const hasBothAI = product.aiImageUrl && product.aiProductUrl;

    return (
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border border-gray-100/50 flex flex-col h-full group overflow-hidden">
            <div className="relative h-80 overflow-hidden bg-gray-50 text-center">
                {/* Image Layer: Primary */}
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-1000 ${hasBothAI ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-110'}`}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-100 p-8">
                        <div className="relative">
                            <Wand2 className="text-purple-400 animate-pulse mb-4" size={48} />
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="text-purple-300 animate-bounce" size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] animate-pulse">Generando Sesión IA...</p>
                        <p className="text-[9px] text-gray-400 mt-2 font-medium">Espera unos segundos para <br /> ver el resultado final</p>
                    </div>
                )}

                {/* Image Layer: Hover (Dual AI transition) */}
                {hasBothAI && (
                    <img
                        src={hoverImage}
                        alt={`${product.name} detalle`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100"
                    />
                )}

                {/* Status Indicator (Subtle) */}
                <div className="absolute bottom-4 left-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 text-center pointer-events-none">
                    <span className="bg-black/40 backdrop-blur-md text-white/90 text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/10">
                        {product.aiProductUrl ? 'Vista: Detalle Premium' : 'Vista: Diseño IA'}
                    </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/40 shadow-sm transition-all group-hover:bg-white/60">
                        <span className="text-[10px] font-extrabold text-gray-800 uppercase tracking-widest">{product.category || 'Destacado'}</span>
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-red-500 text-gray-800 hover:text-white p-2.5 rounded-2xl shadow-lg backdrop-blur-md border border-white/40 transition-all duration-300 z-20"
                    >
                        <Trash2 size={16} />
                    </button>
                )}

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
