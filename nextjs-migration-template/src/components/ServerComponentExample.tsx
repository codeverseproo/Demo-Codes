// Example Server Component that fetches data
// This runs on the server and can access databases, APIs, etc.

async function fetchServerData() {
  // Simulate API call or database query
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    timestamp: new Date().toISOString(),
    serverMessage: 'This data was fetched on the server!',
    randomNumber: Math.floor(Math.random() * 1000)
  };
}

export async function ServerComponentExample() {
  const data = await fetchServerData();
  
  return (
    <div className="feature-card">
      <h3>🖥️ Server Component</h3>
      <p><strong>Server Timestamp:</strong> {data.timestamp}</p>
      <p><strong>Message:</strong> {data.serverMessage}</p>
      <p><strong>Random Number:</strong> {data.randomNumber}</p>
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
        This component runs on the server. The data is fetched during server-side rendering,
        so it's immediately available when the page loads. No loading states needed!
      </p>
    </div>
  );
}

