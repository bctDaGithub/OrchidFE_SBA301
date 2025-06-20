# React + Vite Tutorial

This tutorial will guide you through setting up a new React project using Vite, a modern build tool that provides a faster and leaner development experience.

## Prerequisites

Before you begin, make sure you have the following installed:
- Node.js (version 14.18+ or 16+)
- npm (comes with Node.js) or yarn

## Step 1: Create a New Vite Project

Open your terminal and run one of the following commands:

Using npm:
```bash
npm create vite@latest my-react-app -- --template react
```

Using yarn:
```bash
yarn create vite my-react-app --template react
```

## Step 2: Navigate to Project Directory

```bash
cd my-react-app
```

## Step 3: Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn
```

## Step 4: Start the Development Server

Using npm:
```bash
npm run dev
```

Using yarn:
```bash
yarn dev
```

Your application will be available at `http://localhost:5173` by default.

## Recommended Project Structure

Here's a recommended project structure for organizing your React application:

```
my-react-app/
├── src/
│   ├── components/           # Reusable components
│   │   ├── common/          # Shared components (Button, Input, Card, etc.)
│   │   ├── layout/          # Layout components (Header, Footer, Sidebar, etc.)
│   │   └── features/        # Feature-specific components
│   │
│   ├── styles/              # CSS and styling files
│   │   ├── components/      # Component-specific styles
│   │   ├── layouts/         # Layout-specific styles
│   │   ├── variables.css    # CSS variables and theme
│   │   └── global.css       # Global styles
│   │
│   ├── pages/               # Page components
│   │   ├── Home/
│   │   ├── About/
│   │   └── Contact/
│   │
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── services/            # API services and external integrations
│   ├── context/             # React Context providers
│   ├── assets/              # Static assets (images, fonts, etc.)
│   ├── App.jsx
│   └── main.jsx
│
├── public/                  # Public static files
├── index.html
├── vite.config.js
└── package.json
```

### Structure Explanation

1. **components/**
   - `common/`: Reusable UI components like buttons, inputs, cards
   - `layout/`: Components that define the page structure
   - `features/`: Components specific to certain features

2. **styles/**
   - `components/`: CSS files for individual components
   - `layouts/`: CSS files for layout components
   - `variables.css`: CSS variables for consistent theming
   - `global.css`: Global styles and resets

3. **pages/**
   - Each page component in its own folder
   - Can include page-specific components and styles

4. **hooks/**
   - Custom React hooks for reusable logic

5. **utils/**
   - Helper functions and utilities

6. **services/**
   - API calls and external service integrations

7. **context/**
   - React Context providers for state management

8. **assets/**
   - Images, fonts, and other static files

### Example Component Structure

Here's how you might structure a component:

```
components/
└── common/
    └── Button/
        ├── Button.jsx
        ├── Button.css
        └── index.js
```

### Example Style Structure

```
styles/
├── components/
│   ├── Button.css
│   └── Card.css
├── layouts/
│   ├── Header.css
│   └── Footer.css
├── variables.css
└── global.css
```

## Key Features of Vite

1. **Fast Development Server**: Vite provides an extremely fast development server with hot module replacement (HMR).
2. **Optimized Build**: Production builds are optimized using Rollup.
3. **TypeScript Support**: Built-in TypeScript support.
4. **CSS Pre-processors**: Support for CSS pre-processors like SASS, LESS, etc.
5. **Environment Variables**: Support for `.env` files.

## Available Scripts

- `npm run dev` or `yarn dev`: Start the development server
- `npm run build` or `yarn build`: Build the project for production
- `npm run preview` or `yarn preview`: Preview the production build locally

## Adding Dependencies

To add new dependencies:

Using npm:
```bash
npm install package-name
```

Using yarn:
```bash
yarn add package-name
```

## Best Practices

1. **Component Organization**: Keep your components in a `components` folder
2. **State Management**: Use React hooks for local state, consider Redux or Context API for global state
3. **Routing**: Add React Router for navigation
4. **Styling**: Use CSS modules or styled-components for component-specific styles
5. **Testing**: Set up Jest and React Testing Library for testing

## Next Steps

1. Set up routing with React Router
2. Add a state management solution
3. Configure ESLint and Prettier
4. Set up testing environment
5. Add TypeScript (optional)

## Resources

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite GitHub Repository](https://github.com/vitejs/vite)

## Troubleshooting

If you encounter any issues:

1. Make sure you're using a compatible Node.js version
2. Clear your node_modules and reinstall dependencies
3. Check the Vite GitHub issues for known problems
4. Ensure all dependencies are up to date

Happy coding! 🚀 