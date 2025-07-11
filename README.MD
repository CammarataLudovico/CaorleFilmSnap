# 🚀 Tech Stack

## 🖼️ Frontend
- **⚛️ React**  
- **⚡ Vite**   
- **🔗 Gaxios/Fetch** for API calls

## 🛠️ Backend
- **🌐 Express.js**  
- **🗄️ Multer** for file upload  
- **🌍 CORS** cross-origin  
- **🌱 i18next** for multilanguage

## 🗄️ Database
- **🪶 SQLite3**  

---

> **A modern, lightweight, and easily deployable stack!**

---

# 📦 Features
- Photo upload and moderation system
- Multilanguage support (EN, IT, DE, ES)
- Fast development workflow with Vite and React
- RESTful API backend with Express.js
- File management and directory listing
- SQLite3 database for lightweight storage

# 📁 Folder Structure
```
CaorleFilmSnap-V2/
├── src/
│   ├── backend/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── uploads/
│   └── frontend/
│       ├── src/
│       └── public/
├── data/
├── locales/
├── package.json
└── README.MD
```

# ⚡ Quick Start

1. **Clone the repository**
   ```sh
   git clone <repo-url>
   cd CaorleFilmSnap-V2
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Start development servers**
   ```sh
   npm start
   ```
   This will launch both backend and frontend concurrently.

# 📝 Usage
- Access the frontend at `http://localhost:5173`
- Backend API runs at `http://localhost:3001`
- Upload photos via the provided UI or API endpoints
- Moderate and approve photos through the admin interface

# 🌍 Localization
- Translation files are located in `locales/`
- Easily add new languages by creating a new translation file

# 🛡️ Deployment
- The stack is designed for easy deployment on any Node.js-compatible host
- For production, configure environment variables and use a process manager (e.g., PM2)

---

> **Contributions and feedback are welcome!**