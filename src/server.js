const express = require('express')
const cors = require('cors')

const server = express();
const PORT = 3001;

server.use(cors);
server.use(express.json);

server.listen(PORT, () => {
    console.log('Server in Ascolto!')
})