const express = require('express')
const cors = require('cors')

const server = express();
const PORT = 3001;

server.use(cors());
server.use(express.json());

server.get('/', (_req, res) => {
    res.send("Hello World");
})

server.use((req, res) => {
  res.status(404).send('Pagina non Trovata');
});


server.listen(PORT, () => {
    console.log('Server in Ascolto!')
})