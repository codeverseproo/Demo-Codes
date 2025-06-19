# Next.js Migration Template

A comprehensive Next.js App Router migration template with best-practice configurations for transitioning from Create React App.

## 🚀 Features

- **App Router**: Built with the latest Next.js App Router
- **Server Components**: Leverage React Server Components for better performance
- **TypeScript**: Full TypeScript support with proper path mapping
- **Responsive Design**: Mobile-first responsive design
- **API Routes**: Built-in API endpoints example
- **Best Practices**: Optimized configurations and modern patterns

## 📁 Project Structure

```
src/
├── app/                    # App Router directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Client-side providers
│   ├── globals.css        # Global styles
│   ├── about/             # About page
│   ├── examples/          # Examples page
│   └── api/               # API routes
├── components/            # Reusable components
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

## 🛠️ Getting Started

1. **Clone or fork this repository**
   ```bash
   git clone <repository-url>
   cd nextjs-migration-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Migration Checklist

### Pre-Migration Audit
- [ ] List all dependencies in `package.json`
- [ ] Document current routing structure
- [ ] Inventory data fetching patterns
- [ ] Check environment variables
- [ ] Review styling approach
- [ ] Audit public assets

### Migration Steps
- [ ] Remove `react-scripts` and install Next.js
- [ ] Update `package.json` scripts
- [ ] Create `next.config.mjs` and `tsconfig.json`
- [ ] Set up App Router structure
- [ ] Migrate components to Server/Client Components
- [ ] Convert routing to file-based system
- [ ] Update data fetching patterns
- [ ] Migrate environment variables
- [ ] Update styling imports
- [ ] Test and optimize

## 🔧 Configuration Files

### `next.config.mjs`
- Turbopack configuration for faster builds
- Image optimization settings
- Security headers
- Performance optimizations

### `tsconfig.json`
- Path mapping for clean imports
- Strict TypeScript configuration
- Next.js plugin integration

## 📚 Key Concepts

### Server Components vs Client Components

**Server Components** (default):
- Run on the server
- Can fetch data directly
- Zero JavaScript sent to client
- Cannot use hooks or browser APIs

**Client Components** (`'use client'`):
- Run in the browser
- Can use React hooks
- Handle user interactions
- Access browser APIs

### Data Fetching Patterns

**Before (CRA)**:
```jsx
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <div>{data?.message}</div>;
}
```

**After (Next.js App Router)**:
```jsx
async function Component() {
  const data = await fetch('/api/data');
  const result = await data.json();
  
  return <div>{result.message}</div>;
}
```

## 🎯 Best Practices

1. **Use Server Components by default** - Only add `'use client'` when needed
2. **Fetch data in Server Components** - Eliminate loading states and waterfalls
3. **Optimize images** - Use `next/image` for automatic optimization
4. **Implement proper metadata** - Use the Metadata API for SEO
5. **Follow the App Router patterns** - Leverage layouts, loading, and error boundaries

## 🔗 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

## 📄 License

This template is available under the MIT License. Feel free to use it for your projects!

---

**Happy migrating!** 🎉

