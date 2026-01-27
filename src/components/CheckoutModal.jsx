import React, { useState } from 'react';
import { CreditCard, X, Check, Loader2 } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, total, cart, clearCart, formatCLP }) => {
    const [step, setStep] = useState('payment'); // payment, processing, success

    if (!isOpen) return null;

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            clearCart();
        }, 2500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"><X size={20} /></button>

                {step === 'payment' && (
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-1 text-gray-900">Finalizar Compra</h2>
                        <p className="text-sm text-gray-500 mb-6">Total a pagar: <span className="text-gray-900 font-bold">{formatCLP(total)}</span></p>

                        <div className="space-y-3 mb-6">
                            <div className="border border-blue-500 bg-blue-50 p-4 rounded-xl flex items-center justify-between cursor-pointer ring-1 ring-blue-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold">MP</div>
                                    <span className="font-semibold text-blue-900">Mercado Pago</span>
                                </div>
                                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-xl flex items-center justify-between opacity-60 cursor-not-allowed">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={20} className="text-gray-400" />
                                    <span className="font-medium text-gray-600">Transferencia</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Aceptamos</h4>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-white border rounded text-xs font-bold text-blue-800">RedCompra</span>
                                <span className="px-2 py-1 bg-white border rounded text-xs font-bold text-orange-600">Mastercard</span>
                                <span className="px-2 py-1 bg-white border rounded text-xs font-bold text-blue-600">Visa</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePay}
                            className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
                        >
                            Pagar {formatCLP(total)}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span> Pagos procesados seguramente por Mercado Pago
                        </p>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-800">Procesando pago con RedCompra...</h3>
                        <p className="text-sm text-gray-500 mt-2">Por favor no cierres esta ventana.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-8 flex flex-col items-center justify-center text-center bg-green-50 h-full">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Check size={32} strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-bold text-green-800 mb-2">¡Compra Exitosa!</h3>
                        <p className="text-green-700 mb-6">Tu pedido ha sido confirmado. Recibirás un correo con los detalles.</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                        >
                            Seguir comprando
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;
