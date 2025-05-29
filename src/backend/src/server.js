const express = require('express')
const cors = require('cors')
const uploadRoutes = require('../routes/upload');
const serveIndex = require('serve-index');

const server = express();
const PORT = 3001;

server.use(cors());
server.use(express.json());

server.get('/', (_req, res) => {
    res.send("Hello World");
})

const path = require('path');

// server.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
server.use('/api', uploadRoutes);
server.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')), serveIndex(path.join(__dirname, '..', 'uploads'), {'icons': true})); // gestione intera cartella file

server.use((req, res) => {
  res.status(404).send('Pagina non Trovata');
});

server.listen(PORT, () => {
    console.log('Server in Ascolto!')
})