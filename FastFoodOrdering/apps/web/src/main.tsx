// apps/web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { useAppState } from './hooks/useAppState';
import { setApiBaseUrl } from '@fastfoodordering/utils';


setApiBaseUrl('https://chiasmal-puffingly-etsuko.ngrok-free.dev/api');
// Component nhỏ để load user từ localStorage (hook hợp lệ)
function InitPersistedState() {
  const { loadPersistedState } = useAppState();
  React.useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  
    <BrowserRouter>
      <InitPersistedState />
      <App />
    </BrowserRouter>
  
);