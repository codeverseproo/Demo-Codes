import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <div className="hero">
        <h1>Welcome to Your Next.js Migration Template</h1>
        <p>
          This template provides a solid foundation for migrating from Create React App 
          to Next.js with the App Router. It includes best-practice configurations and 
          modern patterns.
        </p>
        
        <div className="features">
          <div className="feature-card">
            <h3>🚀 App Router</h3>
            <p>Built with the latest Next.js App Router for better performance and developer experience.</p>
          </div>
          
          <div className="feature-card">
            <h3>⚡ Server Components</h3>
            <p>Leverage React Server Components for zero-JavaScript server-rendered content.</p>
          </div>
          
          <div className="feature-card">
            <h3>🎯 TypeScript Ready</h3>
            <p>Full TypeScript support with proper path mapping and type safety.</p>
          </div>
          
          <div className="feature-card">
            <h3>📱 Responsive Design</h3>
            <p>Mobile-first responsive design with modern CSS practices.</p>
          </div>
        </div>
        
        <div className="actions">
          <Link href="/about" className="button primary">
            Learn More
          </Link>
          <Link href="/examples" className="button secondary">
            View Examples
          </Link>
        </div>
      </div>
    </main>
  );
}

