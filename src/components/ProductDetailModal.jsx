import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart, formatCLP }) => {
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen || !product) return null;

    // Get available images
    const images = [
        product.aiImageUrl,
        product.aiProductUrl,
        product.imageUrl
    ].filter(Boolean);

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product);
        }
        onClose();
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const incrementQuantity = () => {
        if (quantity < (product.stock || 99)) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[3rem] max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl hover:bg-gray-100 transition-all shadow-lg"
                >
                    <X size={24} className="text-gray-800" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-h-[90vh] overflow-y-auto">
                    {/* Image Gallery */}
                    <div className="relative bg-gray-50 p-8 lg:p-12 flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
                        {images.length > 0 && (
                            <>
                                <img
                                    src={images[currentImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-contain rounded-2xl"
                                />

                                {/* Image Navigation */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-full hover:bg-white transition-all shadow-lg"
                                        >
                                            <ChevronLeft size={24} className="text-gray-800" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-full hover:bg-white transition-all shadow-lg"
                                        >
                                            <ChevronRight size={24} className="text-gray-800" />
                                        </button>

                                        {/* Image Indicators */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                            {images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                                                            ? 'bg-purple-600 w-8'
                                                            : 'bg-gray-300 hover:bg-gray-400'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="p-8 lg:p-12 flex flex-col">
                        {/* Category Badge */}
                        <div className="mb-6">
                            <span className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                                {product.category || 'Producto'}
                            </span>
                        </div>

                        {/* Product Name */}
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                            {product.name}
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 text-lg leading-relaxed mb-8 font-medium">
                            {product.description}
                        </p>

                        {/* Price */}
                        <div className="mb-8 pb-8 border-b border-gray-100">
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-2">
                                Precio
                            </span>
                            <span className="text-5xl font-black text-gray-900 tracking-tighter">
                                {formatCLP(product.price)}
                            </span>
                        </div>

                        {/* Stock Info */}
                        {product.stock && (
                            <div className="mb-6">
                                <span className="text-sm font-medium text-gray-500">
                                    {product.stock > 10
                                        ? `✅ En stock (${product.stock} disponibles)`
                                        : `⚠️ Últimas ${product.stock} unidades`
                                    }
                                </span>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-8">
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-3">
                                Cantidad
                            </span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                    className="bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-xl transition-all"
                                >
                                    <Minus size={20} className="text-gray-800" />
                                </button>
                                <span className="text-3xl font-black text-gray-900 w-16 text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={incrementQuantity}
                                    disabled={quantity >= (product.stock || 99)}
                                    className="bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-xl transition-all"
                                >
                                    <Plus size={20} className="text-gray-800" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-gray-900 hover:bg-purple-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95"
                        >
                            <ShoppingBag size={20} />
                            Agregar al Carrito ({quantity})
                        </button>

                        {/* Subtotal */}
                        <div className="mt-6 text-center">
                            <span className="text-sm text-gray-500 font-medium">
                                Subtotal: <span className="font-black text-gray-900">{formatCLP(product.price * quantity)}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
