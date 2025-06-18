import type { Metadata } from 'next';
import Link from 'next/link';
import { ServerComponentExample } from '@/components/ServerComponentExample';
import { ClientComponentExample } from '@/components/ClientComponentExample';

export const metadata: Metadata = {
  title: 'Examples',
  description: 'Examples of Server Components, Client Components, and migration patterns.',
};

export default function ExamplesPage() {
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
        <h1>Migration Examples</h1>
        <p>
          See how different patterns from Create React App translate to Next.js App Router.
        </p>
      </div>
      
      <section style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Server Component Example</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Server Components run on the server and can fetch data directly without client-side effects.
          </p>
          <ServerComponentExample />
        </div>
        
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Client Component Example</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Client Components run in the browser and can use hooks, event handlers, and browser APIs.
          </p>
          <ClientComponentExample />
        </div>
        
        <div className="actions">
          <Link href="/about" className="button primary">
            Learn More
          </Link>
          <Link href="/" className="button secondary">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

