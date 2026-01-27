import React from 'react';
import { ShoppingBag, Trash2, Wand2 } from 'lucide-react';

const ProductCard = ({ product, onAddCart, onTryOn, isAdmin, onDelete, formatCLP }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full">
        <div className="relative h-64 overflow-hidden bg-gray-100 group">
            <img
                src={product.imageUrl || "https://via.placeholder.com/400x400?text=Sin+Imagen"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {isAdmin && (
                <button
                    onClick={() => onDelete(product.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-sm"
                >
                    <Trash2 size={16} />
                </button>
            )}
            <button
                onClick={() => onTryOn(product)}
                className="absolute bottom-2 right-2 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-purple-700 shadow-md transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            >
                <Wand2 size={14} /> IA Model
            </button>
        </div>

        <div className="p-4 flex flex-col flex-grow">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.category}</div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <span className="text-xl font-bold text-gray-900">{formatCLP(product.price)}</span>
                <button
                    onClick={() => onAddCart(product)}
                    className="bg-gray-900 text-white p-2.5 rounded-lg hover:bg-gray-800 transition-colors active:scale-95"
                >
                    <ShoppingBag size={18} />
                </button>
            </div>
        </div>
    </div>
);

export default ProductCard;
