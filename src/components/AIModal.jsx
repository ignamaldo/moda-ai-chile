import React, { useState, useEffect } from 'react';
import { X, Camera, Wand2, Loader2 } from 'lucide-react';
import { GEMINI_API_KEY } from '../firebaseConfig';

const generateModelImage = async (productImageBase64, productDescription) => {
    const apiKey = GEMINI_API_KEY;

    if (!apiKey || apiKey === "TU_GEMINI_API_KEY_AQUI") {
        throw new Error("Falta configurar la GEMINI_API_KEY en firebaseConfig.js");
    }

    // Usamos el modelo capaz de editar/entender imagen para generar una nueva basada en el contexto
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

    const prompt = `Actúa como un fotógrafo de moda profesional. 
  Genera una imagen fotorrealista de una modelo (mujer u hombre según corresponda al producto) vistiendo el siguiente artículo de moda.
  
  El artículo es: ${productDescription}.
  
  La imagen debe parecer una fotografía de estudio de alta calidad para una tienda de ropa online (e-commerce). 
  Asegúrate de que la prenda se vea claramente y sea el foco principal. Fondo neutro o urbano desenfocado.`;

    const payload = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: productImageBase64
                    }
                }
            ]
        }],
        generationConfig: {
            responseModalities: ["IMAGE"], // Forzamos respuesta de imagen si el modelo lo soporta, o texto+imagen
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Error al conectar con la IA de Google');

        const data = await response.json();

        // Extraer la imagen base64 de la respuesta
        // Nota: La estructura de respuesta puede variar según la versión de la API y modelo
        // Ajustar según la respuesta real de Gemini Vision
        const imageBase64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

        if (imageBase64) {
            return `data:image/jpeg;base64,${imageBase64}`;
        } else {
            // Si no devuelve imagen directa, puede que devuelva texto o haya fallado
            throw new Error('No se generó imagen. Intenta describir mejor el producto.');
        }
    } catch (error) {
        console.error("Error IA:", error);
        throw error;
    }
};

const AIModal = ({ isOpen, onClose, product }) => {
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setGeneratedImage(null);
            setError(null);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        if (!product) return;
        setLoading(true);
        setError(null);

        try {
            // Necesitamos convertir la URL de la imagen a base64 (limpio) para enviarla a Gemini
            // Nota: Esto funciona mejor si la imagen ya está en base64 en la BD, 
            // si es una URL externa puede haber problemas de CORS.

            let base64Image = "";

            if (product.imageUrl.startsWith('data:image')) {
                base64Image = product.imageUrl.split(',')[1];
            } else {
                // Fallback para demo: no podemos descargar imágenes externas por CORS en iframe fácilmente
                // En producción, esto se haría via proxy o backend function
                throw new Error("Para usar la IA en esta demo, sube una imagen real desde tu dispositivo en el panel de admin (no una URL externa), para tener el base64 local.");
            }

            const result = await generateModelImage(base64Image, `${product.name} - ${product.description}`);
            setGeneratedImage(result);
        } catch (err) {
            setError(err.message || "Error al generar la imagen.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-purple-50">
                    <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                        <Wand2 className="text-purple-600" size={20} /> Estudio Virtual con IA
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Input Product */}
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Producto Original</h3>
                            <div className="rounded-lg overflow-hidden border border-gray-200 aspect-square relative bg-gray-50">
                                <img src={product?.imageUrl} className="w-full h-full object-cover" alt="Producto" />
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{product?.name}</p>
                        </div>

                        {/* Output Model */}
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-purple-600 mb-2">Modelo Generado por IA</h3>
                            <div className="rounded-lg overflow-hidden border-2 border-dashed border-purple-200 aspect-square relative bg-purple-50 flex items-center justify-center">
                                {loading ? (
                                    <div className="text-center p-4">
                                        <Loader2 className="animate-spin text-purple-600 mx-auto mb-2" size={32} />
                                        <p className="text-xs text-purple-600 font-medium">Diseñando sesión de fotos...</p>
                                    </div>
                                ) : generatedImage ? (
                                    <img src={generatedImage} className="w-full h-full object-cover animate-in fade-in" alt="IA Generada" />
                                ) : error ? (
                                    <div className="text-center p-4 text-red-500 text-sm">{error}</div>
                                ) : (
                                    <div className="text-center p-4 text-gray-400">
                                        <Camera size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">Pulsa generar para ver a una modelo con este producto</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cerrar</button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-200"
                    >
                        {loading ? 'Generando...' : 'Generar Modelo'} <Wand2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIModal;
