import React, { useState, useEffect } from 'react';
import { X, Camera, Wand2, Loader2 } from 'lucide-react';
import { GEMINI_API_KEY } from '../firebaseConfig';

const generateModelImage = async (productImageBase64, productDescription) => {
    const apiKey = GEMINI_API_KEY;

    if (!apiKey || apiKey === "TU_GEMINI_API_KEY_AQUI") {
        throw new Error("Falta configurar la GEMINI_API_KEY en firebaseConfig.js");
    }

    // Usamos gemini-1.5-flash ya que es rápido y soporta imagen + texto
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Actúa como un fotógrafo de alta costura para una revista de élite (como Vogue o Harper's Bazaar).
  OBJETIVO: Crear una imagen publicitaria de nivel editorial donde una modelo de alta costura viste el artículo de moda adjunto.
  
  ARTÍCULO A RESALTAR: ${productDescription}.
  
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
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: productImageBase64
                    }
                }
            ]
        }]
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
        const imageBase64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

        if (imageBase64) {
            return `data:image/jpeg;base64,${imageBase64}`;
        } else {
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

    const loadingMessages = [
        "Analizando el estilo del producto...",
        "Diseñando sesión de fotos virtual...",
        "Ajustando la iluminación de estudio...",
        "Posicionando modelo profesional...",
        "Generando resultado final..."
    ];

    const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setLoadingMessageIdx(prev => (prev + 1) % loadingMessages.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleGenerate = async () => {
        if (!product) return;
        setLoading(true);
        setError(null);
        setLoadingMessageIdx(0);

        try {
            let base64Image = "";

            if (product.imageUrl.startsWith('data:image')) {
                base64Image = product.imageUrl.split(',')[1];
            } else {
                throw new Error("Para usar la IA, sube una imagen real desde el panel de admin para procesar los datos locales.");
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
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
                    <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                        <Wand2 className="text-purple-600 animate-pulse" size={20} /> Estudio de Estilo IA
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 p-1 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Input Product */}
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Producto Original</h3>
                            <div className="rounded-xl overflow-hidden border border-gray-100 aspect-square relative bg-gray-50 shadow-inner">
                                <img src={product?.imageUrl} className="w-full h-full object-cover" alt="Producto" />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-800">{product?.name}</p>
                        </div>

                        {/* Output Model */}
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">Vista Previa con IA</h3>
                            <div className="rounded-xl overflow-hidden border-2 border-dashed border-purple-100 aspect-square relative bg-purple-50/30 flex items-center justify-center shadow-inner">
                                {loading ? (
                                    <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl">
                                        <Loader2 className="animate-spin text-purple-600 mx-auto mb-3" size={40} />
                                        <p className="text-sm text-purple-700 font-bold animate-pulse">{loadingMessages[loadingMessageIdx]}</p>
                                    </div>
                                ) : generatedImage ? (
                                    <img src={generatedImage} className="w-full h-full object-cover animate-in fade-in zoom-in-110 duration-1000" alt="IA Generada" />
                                ) : error ? (
                                    <div className="text-center p-6 text-red-500 text-sm bg-red-50 w-full h-full flex flex-col items-center justify-center">
                                        <X size={32} className="mb-2 opacity-50" />
                                        <p className="font-medium px-4">{error}</p>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 text-gray-400 group cursor-pointer" onClick={handleGenerate}>
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <Camera size={32} className="opacity-30 group-hover:opacity-60 transition-opacity" />
                                        </div>
                                        <p className="text-xs font-medium max-w-[150px] mx-auto">Pulsa 'Generar' para ver a una modelo profesional con este producto</p>
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
