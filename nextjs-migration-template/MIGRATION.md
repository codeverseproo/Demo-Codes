# Migration Guide

This document provides a step-by-step guide for migrating from Create React App to Next.js using this template.

## Pre-Migration Checklist

### 1. Audit Your Current CRA Project

- [ ] **Dependencies**: List all packages in `package.json`
  - Remove `react-scripts`
  - Check for CRA-specific packages
  - Identify browser-only libraries that need `'use client'`

- [ ] **Routing**: Document your current routes
  - Map React Router routes to file-based routing
  - Identify dynamic routes and parameters
  - Note any protected routes or route guards

- [ ] **Data Fetching**: Find all `useEffect` data fetching
  - Classify as static, dynamic, or client-side data
  - Plan migration to Server Components where appropriate

- [ ] **Environment Variables**: Update variable names
  - Change `REACT_APP_*` to `NEXT_PUBLIC_*` for client-side
  - Remove prefix for server-only variables

- [ ] **Styling**: Review your styling approach
  - Global CSS imports
  - CSS Modules
  - CSS-in-JS libraries (need special setup)

## Migration Steps

### Step 1: Project Setup

1. **Install Next.js and remove CRA**:
   ```bash
   npm uninstall react-scripts
   npm install next@latest react@latest react-dom@latest
   ```

2. **Update package.json scripts**:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     }
   }
   ```

3. **Create configuration files**:
   - Copy `next.config.mjs` from this template
   - Copy `tsconfig.json` from this template
   - Copy `.eslintrc.json` from this template

### Step 2: Directory Structure

1. **Create the App Router structure**:
   ```
   src/
   ├── app/
   │   ├── layout.tsx
   │   ├── page.tsx
   │   ├── globals.css
   │   └── providers.tsx
   ├── components/
   ├── lib/
   ├── hooks/
   └── types/
   ```

2. **Move your components**:
   - Copy components to `src/components/`
   - Add `'use client'` to components that use hooks or browser APIs
   - Keep Server Components without the directive

### Step 3: Routing Migration

1. **Convert React Router to file-based routing**:
   
   **Before (React Router)**:
   ```jsx
   <Route path="/about" component={About} />
   <Route path="/blog/:slug" component={BlogPost} />
   ```
   
   **After (Next.js)**:
   ```
   src/app/about/page.tsx
   src/app/blog/[slug]/page.tsx
   ```

2. **Update navigation**:
   
   **Before**:
   ```jsx
   import { Link } from 'react-router-dom';
   <Link to="/about">About</Link>
   ```
   
   **After**:
   ```jsx
   import Link from 'next/link';
   <Link href="/about">About</Link>
   ```

### Step 4: Data Fetching Migration

1. **Convert useEffect data fetching to Server Components**:
   
   **Before (CRA)**:
   ```jsx
   function BlogPost({ id }) {
     const [post, setPost] = useState(null);
     
     useEffect(() => {
       fetch(`/api/posts/${id}`)
         .then(res => res.json())
         .then(setPost);
     }, [id]);
     
     if (!post) return <div>Loading...</div>;
     
     return <div>{post.title}</div>;
   }
   ```
   
   **After (Next.js)**:
   ```jsx
   async function BlogPost({ params }) {
     const post = await fetch(`/api/posts/${params.id}`);
     const data = await post.json();
     
     return <div>{data.title}</div>;
   }
   ```

2. **Keep client-side data fetching in Client Components**:
   ```jsx
   'use client';
   
   function SearchResults() {
     const [results, setResults] = useState([]);
     
     const handleSearch = async (query) => {
       const res = await fetch(`/api/search?q=${query}`);
       const data = await res.json();
       setResults(data);
     };
     
     return (
       <div>
         <SearchInput onSearch={handleSearch} />
         <ResultsList results={results} />
       </div>
     );
   }
   ```

### Step 5: Environment Variables

1. **Update variable names**:
   
   **Before**:
   ```
   REACT_APP_API_URL=https://api.example.com
   ```
   
   **After**:
   ```
   NEXT_PUBLIC_API_URL=https://api.example.com  # For client-side
   API_SECRET_KEY=secret123                     # For server-only
   ```

### Step 6: Styling Migration

1. **Global CSS**:
   - Move global styles to `src/app/globals.css`
   - Import in `src/app/layout.tsx`

2. **CSS Modules**:
   - Ensure files follow `[name].module.css` naming
   - Update imports if needed

3. **CSS-in-JS**:
   - Set up style registry for server-side rendering
   - Wrap components in providers as needed

### Step 7: Public Assets

1. **Move static assets**:
   - Copy files from `public/` to Next.js `public/`
   - Update references if needed

2. **Migrate index.html content**:
   - Move `<html>` and `<body>` tags to `layout.tsx`
   - Convert meta tags to Metadata API

### Step 8: Testing and Optimization

1. **Test your migration**:
   - Run `npm run dev` and check all pages
   - Test client-side interactions
   - Verify data fetching works correctly

2. **Optimize performance**:
   - Use `next/image` for images
   - Implement proper loading and error boundaries
   - Add metadata for SEO

## Common Issues and Solutions

### Issue: "window is not defined"
**Solution**: Use `'use client'` directive or check `typeof window !== 'undefined'`

### Issue: CSS-in-JS flash of unstyled content
**Solution**: Set up a style registry component for server-side rendering

### Issue: Environment variables not working
**Solution**: Ensure client-side variables have `NEXT_PUBLIC_` prefix

### Issue: Dynamic imports not working
**Solution**: Use Next.js dynamic imports with proper options

## Best Practices

1. **Start with Server Components**: Only add `'use client'` when necessary
2. **Optimize data fetching**: Fetch data in Server Components when possible
3. **Use proper metadata**: Implement SEO-friendly metadata
4. **Follow App Router patterns**: Use layouts, loading, and error boundaries
5. **Test thoroughly**: Ensure all functionality works after migration

## Resources

- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Next.js Documentation](https://nextjs.org/docs)

