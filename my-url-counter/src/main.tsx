// src/index.tsx OR src/main.tsx (Check which file your project uses as the entry point)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import your main App component (default export)
import { BrowserRouter } from 'react-router-dom'; // *** This is essential: Provides the Router context ***

// Find the root HTML element in your public/index.html file where the React app will be mounted
const container = document.getElementById('root');

// Check if the container element was found
if (container) {
  // Create a React root instance for efficient updates
  const root = ReactDOM.createRoot(container);

  // Render the application.
  // BrowserRouter MUST wrap the entire part of your application
  // that uses React Router features (like Link, Routes, Route, useSearchParams, etc.).
  // Your App component and everything inside it NEEDS this context to work without errors.
  root.render(
    <React.StrictMode>

      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // Log an error if the root element is not found - indicates a problem with your public/index.html
  console.error('Root element with ID "root" not found in the document.');
}

