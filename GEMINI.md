# Gemini Code Assistant Context

## Project Overview

This project is a **Visual Query Builder**, a web application designed to help users construct SQL queries through an intuitive drag-and-drop interface. It's a full-stack application built with a modern tech stack, enabling users to visually select tables and columns, apply filters, and generate SQL queries in real-time. The application also allows for direct execution of the generated queries against a PostgreSQL database and viewing the results.

### Key Technologies

*   **Frontend:** React 18 with TypeScript and Vite
*   **Backend:** Node.js with Express.js
*   **Database:** PostgreSQL
*   **Styling:** Tailwind CSS
*   **UI Components:** Custom components, `lucide-react` for icons, and `@dnd-kit` for drag-and-drop functionality.
*   **SQL Editor:** `monaco-editor` is integrated for a rich text editor experience for SQL.

### Architecture

The application is divided into two main parts:

1.  **Frontend (`/src`):** A React single-page application (SPA) that provides the user interface for building queries. It communicates with the backend via a REST API.
2.  **Backend (`/server`):** A Node.js/Express server that acts as a bridge between the frontend and the PostgreSQL database. It exposes endpoints to fetch the database schema, execute queries, and get table previews.

## Building and Running the Project

### Prerequisites

*   Node.js (version 16 or higher)
*   npm or yarn
*   A running PostgreSQL instance

### Setup and Execution

1.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Configure Environment Variables:**
    *   In the root directory, copy `.env.example` to `.env` and update the database connection details.
    *   In the `server` directory, copy `server/.env.example` to `server/.env` and update the database connection details.

4.  **Start the Backend Server:**
    ```bash
    cd server
    npm start
    ```
    The server will run on `http://localhost:3001` by default.

5.  **Start the Frontend Development Server:**
    ```bash
    # From the root directory
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

### Available Scripts (Frontend)

*   `npm run dev`: Starts the development server with hot module replacement.
*   `npm run build`: Builds the application for production.
*   `npm run preview`: Previews the production build locally.
*   `npm run lint`: Lints the codebase using ESLint.

## Development Conventions

*   **Coding Style:** The project uses Prettier for code formatting and ESLint for static analysis. The configuration can be found in `eslint.config.js`.
*   **Type System:** TypeScript is used for static typing. Type definitions for the application are located in the `/src/types` directory.
*   **Component-Based Architecture:** The frontend is built using a component-based architecture. Reusable components are located in `/src/components`.
*   **API Communication:** The frontend communicates with the backend using the `fetch` API, with the API service logic abstracted in `/src/services/apiService.ts`.
*   **State Management:** Component-level state is managed using React hooks (`useState`, `useEffect`, `useCallback`).
