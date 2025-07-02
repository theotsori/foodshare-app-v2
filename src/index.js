import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FoodSharingProvider } from './hooks/useFoodSharing'; // The context provider

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <FoodSharingProvider>
      <App />
    </FoodSharingProvider>
  </React.StrictMode>
);