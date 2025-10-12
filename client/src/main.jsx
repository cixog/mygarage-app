// client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

// 1. Import the AuthProvider
import { AuthProvider } from './context/AuthContext';

// ✅ NEW IMPORT: Import HelmetProvider from the modern library
import { HelmetProvider } from 'react-helmet-async';

// Assuming you use react-router-dom, this should also be imported if needed
// import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap your entire App component with the AuthProvider */}
    <AuthProvider>
      {/* 3. Wrap your App component with the HelmetProvider */}
      {/* ✅ MODIFICATION: Added HelmetProvider wrapper */}
      <HelmetProvider>
        {/* If your router is needed here, wrap App in it. Example: */}
        {/* <BrowserRouter> */}
        <App />
        {/* </BrowserRouter> */}
      </HelmetProvider>
    </AuthProvider>
  </React.StrictMode>
);
