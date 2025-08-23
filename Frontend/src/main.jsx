import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './auth/AuthContext';  
import { CookiesProvider } from 'react-cookie';  // <-- import CookiesProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CookiesProvider>       {/* <-- Wrap here */}
        <AuthProvider>        
          <App />
        </AuthProvider>
      </CookiesProvider>
    </BrowserRouter>
  </StrictMode>
);
