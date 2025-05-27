\# 🧠 React vs HTMX – Todo App Comparison

This project showcases two implementations of a simple Todo App:

\- \*\*React\*\*: A component-based SPA using React for full client-side interactivity.

\- \*\*HTMX\*\*: A server-driven, hypermedia-enhanced approach using plain HTML and HTMX.

The goal is to compare the complexity, code size, and developer experience between the two paradigms.

\---

\## 📂 Folder Structure

\`\`\`bash

js-vs-html-todo/

├── react-todo/ # React implementation

│ ├── client/ # React frontend

│ └── server/ # Node.js + Express backend

├── htmx-todo/ # HTMX implementation

│ └── server/ # Node.js + Express backend serving HTML

└── README.md # This file

🚀 React Implementation

📁 Path: /react-todo

A modern React app with a JSON-based API backend.

🧰 Tech Stack

React

Vite (for fast frontend dev/build)

Express (backend API)

CORS (for cross-origin API access)

📦 Setup Instructions

Clone the repo and navigate to the folder:

bash

Copy

Edit

git clone https://github.com/YOUR\_USERNAME/js-vs-html-todo.git

cd js-vs-html-todo/react-todo

Install dependencies:

bash

Copy

Edit

yarn install

Start the backend server:

bash

Copy

Edit

cd server

yarn install

yarn start

The API server will be running at: http://localhost:4000

Start the frontend:

Open a second terminal:

bash

Copy

Edit

cd client

yarn install

yarn dev

The React app will be available at: http://localhost:5173

📷 Screenshot

Add screenshot here showing the React version in action.

⚡ HTMX Implementation

📁 Path: /htmx-todo

A minimal, declarative Todo App built using HTML + HTMX + Node.js, with no frontend framework.

🧰 Tech Stack

HTMX

Express (backend + HTML rendering)

Plain HTML/CSS

No frontend JavaScript code needed!

📦 Setup Instructions

Navigate to the HTMX folder:

bash

Copy

Edit

cd js-vs-html-todo/htmx-todo

Install dependencies:

bash

Copy

Edit

yarn install

Run the server:

bash

Copy

Edit

node server/server.js

The app will be available at: http://localhost:4000

It renders HTML directly and uses HTMX for interaction.

📷 Screenshot

Add screenshot here showing the HTMX version in action.

🤯 Key Differences

FeatureReactHTMX

Lines of Code~150+ (with JS, JSX, hooks)~20 meaningful lines of HTML

State ManagementuseState/useEffectHandled by the server

Bundle Size~2MB+ (with node\_modules)~14KB (HTMX only)

Build Tools NeededYes (Vite/Webpack/Babel)No

SSR / HTML FragmentsOptional + complexBuilt-in

Progressive EnhancementRequires polyfills/workNative (graceful degradation)

📖 Learn More

HTMX Documentation

React Documentation

Vite Documentation

If Not SPAs, What? – by Tom MacWright

🙋‍♂️ Author

Made with ❤️ by \[Your Name\].

Inspired by real-world developer frustrations and the desire for simpler web apps.

📄 License

MIT License – use this as a learning tool or project starter.
