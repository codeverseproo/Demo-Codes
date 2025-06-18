'use client';

import { useState, useEffect } from 'react';

// Example Client Component that uses browser APIs and state
// This runs in the browser and can use hooks, event handlers, etc.

export function ClientComponentExample() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  
  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!mounted) {
    return (
      <div className="feature-card">
        <div className="loading"></div>
        <p>Loading client component...</p>
      </div>
    );
  }
  
  return (
    <div className="feature-card">
      <h3>💻 Client Component</h3>
      <p><strong>Current Count:</strong> {count}</p>
      <p><strong>Window Width:</strong> {windowWidth}px</p>
      
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setCount(c => c + 1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Increment
        </button>
        
        <button 
          onClick={() => setCount(c => c - 1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Decrement
        </button>
        
        <button 
          onClick={() => setCount(0)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
        This component runs in the browser. It can use React hooks, handle events,
        and access browser APIs like window.innerWidth. Notice the 'use client' directive at the top!
      </p>
    </div>
  );
}

