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
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // Auth
    useEffect(() => {
        const initAuth = async () => {
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
        setIsLoadingProducts(true);
        try {
            const q = query(
                collection(db, 'artifacts', appId, 'public', 'data', 'products'),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(items);
                setIsLoadingProducts(false);
            }, (error) => {
                console.error("Error fetching products:", error);
                setIsLoadingProducts(false);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Firestore Error:", e);
            setIsLoadingProducts(false);
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
        <div className="min-h-screen bg-white font-sans text-gray-900 pb-20 selection:bg-purple-100 selection:text-purple-900">

            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="bg-gray-950 text-white p-2.5 rounded-xl group-hover:bg-purple-600 transition-colors duration-500 shadow-xl shadow-gray-200">
                            <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                            MODA <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-lg text-lg">AI</span> ERP
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsAdminMode(!isAdminMode)}
                            className="text-[11px] px-6 py-2.5 rounded-xl font-bold transition-all duration-300 border border-gray-200 hover:bg-gray-50 text-gray-700 bg-white"
                        >
                            {isAdminMode ? 'Vista Cliente' : 'Vista Admin ERP'}
                        </button>

                        <button
                            className="relative p-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-300 group"
                            onClick={() => setIsCartOpen(!isCartOpen)}
                        >
                            <ShoppingBag size={24} className="text-gray-800 group-hover:scale-110 transition-transform" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black shadow-lg border-2 border-white animate-in zoom-in">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6">

                {/* Admin Section */}
                {isAdminMode && (
                    <div className="animate-in slide-in-from-top-10 duration-700 fade-in">
                        {user ? (
                            <AdminPanel
                                user={user}
                                db={db}
                                appId={appId}
                                products={products}
                                onDelete={deleteProduct}
                                formatCLP={formatCLP}
                            />
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] text-center mb-12">
                                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Wand2 className="text-amber-600 animate-pulse" />
                                </div>
                                <h3 className="text-lg font-black text-amber-900">Autenticando con Firebase...</h3>
                                <p className="text-amber-700/70 text-sm mt-2 max-w-md mx-auto">
                                    Si esto tarda mucho, asegúrate de haber activado el **"Anonymous Sign-in"** en la pestaña de Authentication de tu consola de Firebase.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Hero Section */}
                {!isAdminMode && (
                    <div className="mb-16 text-center py-28 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-purple-950 to-black rounded-[3rem] text-white shadow-[0_40px_100px_-20px_rgba(88,28,135,0.3)] px-8 relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-slow-scroll"></div>
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -mr-40 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                        <div className="relative z-10 max-w-4xl mx-auto">
                            <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-[10px] font-black tracking-[0.3em] uppercase bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-purple-300 shadow-2xl">
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                                Powered by Gemini 1.5 Flash
                            </span>
                            <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-white">
                                Redefine tu <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300">Estilo Personal</span>
                            </h2>
                            <p className="text-lg md:text-xl text-purple-100/60 mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
                                La primera plataforma en Chile que permite visualizar colecciones exclusivas en modelos fotorrealistas con Inteligencia Artificial.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer shadow-xl">
                                    <div className="bg-purple-500/20 p-2 rounded-xl text-purple-300 group-hover:scale-110 transition-transform"><Wand2 size={20} /></div>
                                    <span className="text-xs font-black uppercase tracking-widest">IA Fashion Studio</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer shadow-xl">
                                    <div className="bg-blue-500/20 p-2 rounded-xl text-blue-300 group-hover:scale-110 transition-transform"><CreditCard size={20} /></div>
                                    <span className="text-xs font-black uppercase tracking-widest">WebPay Integration</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Grid Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Colección 2026</h2>
                        <p className="text-gray-400 text-sm font-medium mt-1">Explora nuestras piezas seleccionadas</p>
                    </div>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 overflow-x-auto">
                        {['Todos', 'Ropa', 'Accesorios', 'Zapatos', 'Carteras', 'Mochilas', 'Poleras', 'Polerones'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 rounded-[0.9rem] text-xs font-black transition-all duration-300 uppercase tracking-wider whitespace-nowrap ${selectedCategory === cat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-100 aspect-square rounded-[2rem] mb-4"></div>
                                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ShoppingBag size={40} className="text-gray-200" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No hay piezas disponibles</h3>
                        <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm">Pronto tendremos nuevas llegadas. Si eres admin, puedes agregar productos ahora.</p>
                        {isAdminMode && (
                            <button className="mt-8 px-8 py-3 bg-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-100">Agregar Producto</button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        {products
                            .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory)
                            .map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isAdmin={isAdminMode}
                                    onAddCart={addToCart}
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
