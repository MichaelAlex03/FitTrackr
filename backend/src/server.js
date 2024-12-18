const http = require('http');
const dotenv = require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 8000

//uses app.js as the request listener
const server = http.createServer(app);


server.listen(PORT, () =>{
    console.log(`Listening on port ${PORT}`);
});