import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged,
    signInWithCustomToken
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc
} from 'firebase/firestore';
import {
    ShoppingBag,
    Trash2,
    CreditCard,
    X,
    Wand2
} from 'lucide-react';
import { firebaseConfig } from './firebaseConfig';

// Components
import ProductCard from './components/ProductCard';
import AIModal from './components/AIModal';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'moda-ai-chile'; // ID para colección

const formatCLP = (amount) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
    }).format(amount);
};

export default function App() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [isAdminMode, setIsAdminMode] = useState(false); // Toggle para simular vistas
    const [selectedProductForAI, setSelectedProductForAI] = useState(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Auth
    useEffect(() => {
        const initAuth = async () => {
            // Simple anonymous auth for demo
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Auth Error:", error);
            }
        };
        initAuth();
        return onAuthStateChanged(auth, setUser);
    }, []);

    // Fetch Data
    useEffect(() => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'artifacts', appId, 'public', 'data', 'products'),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(items);
            }, (error) => {
                console.error("Error fetching products:", error);
                // Fallback UI or silent fail for demo if config is wrong
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Firestore Error (check config):", e);
        }
    }, [user]);

    // Cart Logic
    const addToCart = (product) => {
        setCart([...cart, product]);
        setIsCartOpen(true);
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const deleteProduct = async (id) => {
        if (confirm("¿Estás seguro de eliminar este producto?")) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
            } catch (error) {
                console.error("Error deleting:", error);
                alert("Error al eliminar. Revisa permisos.");
            }
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">

            {/* Navbar */}
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-black text-white p-1.5 rounded-lg">
                            <ShoppingBag size={20} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Moda AI <span className="text-purple-600">Chile</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${isAdminMode ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {isAdminMode ? 'Modo Admin' : 'Modo Cliente'}
                        </button>

                        <button
                            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setIsCartOpen(!isCartOpen)}
                        >
                            <ShoppingBag size={24} className="text-gray-700" />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-4 mt-4">

                {/* Admin Section */}
                {isAdminMode && user && (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                        <AdminPanel user={user} db={db} appId={appId} />
                    </div>
                )}

                {/* Hero Section (Only visible for customers) */}
                {!isAdminMode && (
                    <div className="mb-10 text-center py-10 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl text-white shadow-xl px-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 relative z-10">Viste el Futuro</h2>
                        <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-6 relative z-10">La primera tienda en Chile donde puedes usar Inteligencia Artificial para ver cómo lucen nuestros productos en modelos profesionales al instante.</p>
                        <div className="flex justify-center gap-4 relative z-10">
                            <span className="flex items-center gap-1 text-xs font-bold bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/20"><CreditCard size={12} /> WebPay</span>
                            <span className="flex items-center gap-1 text-xs font-bold bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/20"><Wand2 size={12} /> IA Styling</span>
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Catálogo Reciente</h2>
                    <div className="flex gap-2">
                        {['Todos', 'Ropa', 'Carteras'].map(cat => (
                            <button key={cat} className="px-3 py-1 rounded-full text-sm border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No hay productos aún.</p>
                        <p className="text-xs text-gray-400 mt-2">(Asegúrate de configurar firebaseConfig.js correctamente)</p>
                        {isAdminMode && <p className="text-sm text-blue-500 mt-2">¡Agrega tu primer producto arriba!</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isAdmin={isAdminMode}
                                onAddCart={addToCart}
                                onTryOn={setSelectedProductForAI}
                                onDelete={deleteProduct}
                                formatCLP={formatCLP}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-0 z-40 flex justify-end">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="bg-white w-full max-w-sm h-full shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="text-lg font-bold">Tu Carrito ({cart.length})</h2>
                            <button onClick={() => setIsCartOpen(false)}><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">Tu carrito está vacío.</div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center bg-gray-50 p-2 rounded-lg">
                                        <img src={item.imageUrl} className="w-16 h-16 object-cover rounded-md bg-white" alt="mini" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                            <p className="text-gray-500 text-xs">{formatCLP(item.price)}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t bg-gray-50">
                            <div className="flex justify-between mb-4 text-lg font-bold">
                                <span>Total</span>
                                <span>{formatCLP(cartTotal)}</span>
                            </div>
                            <button
                                disabled={cart.length === 0}
                                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                                Ir a Pagar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AIModal
                isOpen={!!selectedProductForAI}
                onClose={() => setSelectedProductForAI(null)}
                product={selectedProductForAI}
            />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                total={cartTotal}
                cart={cart}
                clearCart={() => setCart([])}
                formatCLP={formatCLP}
            />

        </div>
    );
}
