### INIZIALIZZAZIONE PROGETTO ###

**git init**

**npm init** 

### CREAZIONE STRUTTURA CARTELLE ###

CaorleFilmSnap/
├── node_modules/       ← qui ci sono tutte le librerie installate
├── src/
│   ├── backend/
│   └── frontend/
├── package.json        ← elenca le dipendenze e script
└── package-lock.json   ← versione esatta delle dipendenze

### SETUP INIZIALE BACKEND ###

```js
const express = require('express')
const cors = require('cors')

const server = express();
const PORT = 3001;

server.use(cors);
server.use(express.json);

server.listen(PORT, () => {
    console.log('Server in Ascolto!')
})
```

**npm i express** -> cmd
**npm i cors** -> cmd

### SETUP INIZIALE FRONTEND ###

**npm create vite@latest**

### CREAZIONE ROTTE TEST ###

Creaiamo il file **test.http** e dentro scriviamo

```http
###

GET http://localhost:3001/
```

### SETUP COMANDI PER FAR PARTIRE BACKEND E FRONTEND ASSIEME ###

Scarichiamo concurrently con questo comando **npm install concurrently --save-dev**.

Nel package.json, aggiungiamo questo script:

```json
Copia
Modifica
"scripts": {
  "start:backend": "node --watch src/backend/server.js",
  "start:frontend": "npm --prefix src/frontend run dev",
  "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\""
}
```

Ora con ***npm start*** faremo partire sia backend che frontend tutto assieme.

### INSTALLAZIONE MULTER ###

npm i multer -> installazione

nel file server.js aggiungiamo:

```js
const multer = require('multer')
```

