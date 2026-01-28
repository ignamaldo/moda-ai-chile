# Moda AI Chile 🇨🇱 - E-commerce de Próxima Generación

Una plataforma de e-commerce moderna que integra **Inteligencia Artificial (Google Gemini 1.5 Flash)** para ofrecer una experiencia de "Prueba Virtual" fotorrealista.

## 🚀 Características Principales

- **Estudio de Estilo IA**: Visualiza cómo lucen los productos en modelos profesionales mediante IA generativa.
- **Gestión de Inventario Dinámica**: Panel de administración para subir productos con imágenes base64 locales (optimizado para IA).
- **Diseño Premium**: Interfaz fluida con estética de alta gama, glassmorphism y micro-animaciones (Tailwind CSS).
- **Integración con Firebase**: Autenticación persistente y base de datos Firestore en tiempo real.
- **Carrito de Compras y Checkout**: Flujo de compra completo con simulación de pasarela de pago (Mercado Pago / WebPay).

## 🛠️ Tecnologías

- **Frontend**: React.js, Vite, Tailwind CSS.
- **Backend/DB**: Firebase Authentication, Firestore.
- **IA Generativa**: Google Gemini 1.5 Flash (Multimodal).
- **Iconografía**: Lucide React.

## 📋 Requisitos Previos

- Node.js (v18+)
- Una cuenta de [Firebase](https://console.firebase.google.com/)
- Una API Key de [Google AI Studio (Gemini)](https://aistudio.google.com/)

## ⚙️ Configuración

1. **Clonar y descargar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Credenciales**:
   Edita el archivo `src/firebaseConfig.js` y reemplaza los valores con tus llaves reales:
   ```javascript
   export const firebaseConfig = {
       apiKey: "TU_API_KEY",
       authDomain: "tu-proyecto.firebaseapp.com",
       projectId: "tu-proyecto",
       storageBucket: "tu-proyecto.appspot.com",
       messagingSenderId: "...",
       appId: "..."
   };

   export const GEMINI_API_KEY = "TU_GEMINI_API_KEY";
   ```

3. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```

## 👔 Uso del Panel Admin

Para que la función de IA funcione correctamente en esta demo, los productos deben subirse mediante el **Panel Admin** seleccionando un archivo de imagen local (no una URL externa). Esto permite procesar la imagen en Base64 para enviarla a la API de Gemini.

## 📄 Licencia

Este proyecto fue desarrollado como una demostración tecnológica de IA aplicada al retail.
