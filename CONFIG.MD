# Project Configuration Overview

This project is a full-stack web application, combining a **Node.js/Express** backend with a **Vite/React** frontend. Below is a summary of the main configuration and setup steps:

## Backend Configuration
- **Express** powers the API server and handles routing.
- **CORS** middleware allows the frontend to communicate with the backend across origins.
- **Multer** is used for handling file uploads, such as images.
- **Custom Middleware** (see `uploadMiddleware.js`) is used to process uploads and can be reused in different routes.
- **Routes** are organized in `src/backend/routes/`, e.g. `upload.js` for uploads, `pendingPhotos.js` for pending photo logic.
- **serve-index** provides directory listing and file management for folders, useful for serving uploaded files.
- **Database**: Photo metadata is stored in a simple database file (`photos.db`).

## Frontend Configuration
- The frontend is created with **Vite** for fast development and hot reloading.
- **React** is used for building UI components.
- **Tailwind CSS** and **DaisyUI** are installed for utility-first and component-based styling.
- Configuration files like `tailwind.config.js` and `vite.config.ts` are located in the frontend directory.
- The frontend communicates with the backend via HTTP requests to API endpoints.

## Development Workflow
- Use `npm start` to launch both backend and frontend servers concurrently, managed by the `concurrently` package and scripts in `package.json`.
- Test backend routes using the `test.http` file.
- Uploaded files are stored in organized folders:
  - `uploads/original`
  - `uploads/pending`
  - `uploads/approved`

## Localization
- The project supports multiple languages with i18n using the `locales/` directory, with translation files for:
  - English
  - Italian
  - German
  - Spanish

## Additional Notes
- Install all dependencies before starting development.
- For production, use environment variables for sensitive data and add robust error handling in middleware/routes.
- The folder structure is designed for scalability and maintainability, keeping backend and frontend logic separate.