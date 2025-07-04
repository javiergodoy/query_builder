# Visual Query Builder

A modern, intuitive web application for building SQL queries through a visual drag-and-drop interface. Built with React, TypeScript, and Vite.

## 🚀 Features

- **Visual Query Construction**: Build SQL queries using an intuitive interface
- **Real-time SQL Generation**: See your SQL query generated as you build
- **Table & Column Selection**: Easy selection of tables and columns from a mock database schema
- **Conditional Logic**: Add WHERE conditions with various operators
- **Copy to Clipboard**: Easily copy generated SQL queries
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Modern CSS with gradients and animations
- **Icons**: Lucide React for beautiful, consistent icons
- **Drag & Drop**: @dnd-kit libraries (ready for future enhancements)

## 📦 Project Structure

```
src/
├── components/
│   ├── QueryBuilder.tsx    # Main query building interface
│   └── SqlPreview.tsx      # SQL code preview and copy functionality
├── App.tsx                 # Main application component
├── App.css                 # Application styles
└── main.tsx               # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd query_builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start the development server with hot module replacement
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code quality issues

## 🎯 Usage

1. **Select Tables**: Choose from available tables (users, orders, products, categories)
2. **Choose Columns**: Select specific columns from your chosen tables
3. **Add Conditions**: Create WHERE conditions with various operators (=, !=, >, <, etc.)
4. **Generate SQL**: Click "Generate SQL" to see your query
5. **Copy & Use**: Copy the generated SQL to use in your database

## 🔮 Future Enhancements

- [ ] Database connection integration
- [ ] Join operations between tables
- [ ] GROUP BY and HAVING clauses
- [ ] Subquery support
- [ ] Query execution and result preview
- [ ] Save and load query templates
- [ ] Export queries in different formats

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
