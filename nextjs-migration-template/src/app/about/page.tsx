import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about this Next.js migration template and its features.',
};

export default function AboutPage() {
  return (
    <main className="container">
      <nav className="nav">
        <Link href="/" className="nav-brand">Migration Template</Link>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/examples">Examples</Link></li>
        </ul>
      </nav>
      
      <div className="hero">
        <h1>About This Template</h1>
        <p>
          This Next.js migration template is designed to help you transition from 
          Create React App to Next.js with the App Router efficiently and effectively.
        </p>
      </div>
      
      <section style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1rem' }}>What's Included</h2>
        
        <div className="feature-card" style={{ marginBottom: '2rem' }}>
          <h3>🏗️ App Router Structure</h3>
          <p>
            Pre-configured with the latest Next.js App Router, including proper 
            layout components, server components, and client components separation.
          </p>
        </div>
        
        <div className="feature-card" style={{ marginBottom: '2rem' }}>
          <h3>⚙️ Best Practice Configurations</h3>
          <p>
            Includes optimized next.config.mjs, TypeScript configuration with 
            path mapping, and ESLint setup for code quality.
          </p>
        </div>
        
        <div className="feature-card" style={{ marginBottom: '2rem' }}>
          <h3>🎨 Modern Styling</h3>
          <p>
            Responsive CSS with modern practices, including CSS Grid, Flexbox, 
            and mobile-first design principles.
          </p>
        </div>
        
        <div className="feature-card" style={{ marginBottom: '2rem' }}>
          <h3>🔧 Developer Experience</h3>
          <p>
            Optimized for developer productivity with proper TypeScript support, 
            path aliases, and development tools configuration.
          </p>
        </div>
        
        <h2 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Migration Benefits</h2>
        
        <ul style={{ lineHeight: '1.8', color: '#666' }}>
          <li>✅ Better performance with Server Components and automatic code splitting</li>
          <li>✅ Improved SEO with server-side rendering capabilities</li>
          <li>✅ Enhanced developer experience with file-based routing</li>
          <li>✅ Built-in API routes for full-stack development</li>
          <li>✅ Automatic image optimization and performance improvements</li>
          <li>✅ Future-proof architecture following React's direction</li>
        </ul>
        
        <div className="actions" style={{ marginTop: '3rem' }}>
          <Link href="/examples" className="button primary">
            View Examples
          </Link>
          <Link href="/" className="button secondary">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

