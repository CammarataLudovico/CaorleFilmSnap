### PROJECT INITIALIZATION ###

**git init**

**npm init** 

### FOLDER STRUCTURE CREATION ###

CaorleFilmSnap/
├── node_modules/       ← here are all installed libraries
├── src/
│   ├── backend/
│   └── frontend/
├── package.json        ← lists dependencies and scripts
└── package-lock.json   ← exact version of dependencies

### INITIAL BACKEND SETUP ###

```js
const express = require('express')
const cors = require('cors')

const server = express();
const PORT = 3001;

server.use(cors);
server.use(express.json);

server.listen(PORT, () => {
    console.log('Server listening!')
})
```

**npm i express** -> cmd  
**npm i cors** -> cmd

### INITIAL FRONTEND SETUP ###

**npm create vite@latest**

### TEST ROUTES CREATION ###

Create the file **test.http** and write inside:

```http
###

GET http://localhost:3001/
```

### SETUP COMMANDS TO START BACKEND AND FRONTEND TOGETHER ###

Install concurrently with this command: **npm install concurrently --save-dev**.

In package.json, add this script:

```json
"scripts": {
  "start:backend": "node --watch src/backend/server.js",
  "start:frontend": "npm --prefix src/frontend run dev",
  "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\""
}
```

Now with ***npm start*** you will start both backend and frontend together.

### MULTER INSTALLATION ###

npm i multer -> installation

in server.js add:

```js
const multer = require('multer')
```

### MIDDLEWARE CREATION ###

Create the file "uploadMiddleware.js"  
Export it to reuse it

### UPLOADER CREATION ###

Create the file "routes/upload.js"

### INSTALLATION OF serve-index TO MANAGE FOLDER FILES ###

npm install serve-index

// manage entire folder files

### TAILWIND CSS INSTALLATION ###

Command (run inside the **frontend** folder):  
npm install tailwindcss@latest @tailwindcss/vite@latest daisyui@latest