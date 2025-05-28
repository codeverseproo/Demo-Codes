# 🧠 React vs HTMX – Todo App Comparison

This project showcases two implementations of a simple Todo App:

- **React**: A component-based SPA using React for full client-side interactivity.
- **HTMX**: A server-driven, hypermedia-enhanced approach using plain HTML and HTMX.

The goal is to compare the complexity, code size, and developer experience between the two paradigms.

---

## 📂 Folder Structure

<pre><code>js-vs-html-todo/
├── react-todo/          # React implementation
│   ├── client/          # React frontend
│   └── server/          # Node.js + Express backend
├── htmx-todo/           # HTMX implementation
│   └── server/          # Node.js + Express backend serving HTML
└── README.md            # This file
</code></pre>

---

## 🚀 React Implementation

**📁 Path:** `/react-todo`

A modern React app with a JSON-based API backend.

### 🧰 Tech Stack

- React  
- Vite (for fast frontend dev/build)  
- Express (backend API)  
- CORS (for cross-origin API access)

### 📦 Setup Instructions

Clone the repo and navigate to the folder:

```bash
git clone https://github.com/YOUR_USERNAME/js-vs-html-todo.git
cd js-vs-html-todo/react-todo
```

Install dependencies:

```bash
yarn install
```

Start the backend server:

```bash
cd server
yarn install
yarn start
```

The API server will be running at: [http://localhost:4000](http://localhost:4000)

Start the frontend:

Open a second terminal:

```bash
cd client
yarn install
yarn dev
```

The React app will be available at: [http://localhost:5173](http://localhost:5173)

### 📷 Screenshot

_Add screenshot here showing the React version in action._

---

## ⚡ HTMX Implementation

**📁 Path:** `/htmx-todo`

A minimal, declarative Todo App built using HTML + HTMX + Node.js, with no frontend framework.

### 🧰 Tech Stack

- HTMX  
- Express (backend + HTML rendering)  
- Plain HTML/CSS  
- No frontend JavaScript code needed!

### 📦 Setup Instructions

Navigate to the HTMX folder:

```bash
cd js-vs-html-todo/htmx-todo
```

Install dependencies:

```bash
yarn install
```

Run the server:

```bash
node server/server.js
```

The app will be available at: [http://localhost:4000](http://localhost:4000)

It renders HTML directly and uses HTMX for interaction.

### 📷 Screenshot

_Add screenshot here showing the HTMX version in action._

---

## 🤯 Key Differences

| Feature               | React                                  | HTMX                                  |
|-----------------------|-----------------------------------------|----------------------------------------|
| Lines of Code         | ~150+ (with JS, JSX, hooks)             | ~20 meaningful lines of HTML           |
| State Management      | `useState` / `useEffect`               | Handled by the server                  |
| Bundle Size           | ~2MB+ (with `node_modules`)            | ~14KB (HTMX only)                      |
| Build Tools Needed    | Yes (Vite/Webpack/Babel)               | No                                     |
| SSR / HTML Fragments  | Optional + complex                     | Built-in                               |
| Progressive Enhancement | Requires polyfills/work              | Native (graceful degradation)          |

---

## 📖 Learn More

- [HTMX Documentation](https://htmx.org/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [If Not SPAs, What? – by Tom MacWright](https://macwright.com/2020/05/10/spa-fatigue.html)

---

## 🙋‍♂️ Author

Made with ❤️ by BeyondIT.

Inspired by real-world developer frustrations and the desire for simpler web apps.

---

## 📄 License

MIT License – use this as a learning tool or project starter.
