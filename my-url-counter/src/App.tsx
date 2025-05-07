// App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CounterPage from './CounterPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CounterPage />} />
    </Routes>
  );
}

export default App;

