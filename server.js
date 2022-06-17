const PORT = 3000; // Sets the output port

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const pages = [ { url: "/write", file: "/public/write/index.html"}, 
                { url: "/read", file: "/public/read/index.html"} ]

//necsessairy to load script and css files without type mismatch even if in right path
const path = require('path');
app.use('/public', express.static(path.join(__dirname, "public")));

//
pages.forEach( page => {
    app.get(page.url, (req, res) => {
        res.sendFile(`${__dirname}${page.file}`);
    });
});


//
server.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});

io.on('connection', (socket) => {
    console.log(`a user connected with id: ${socket.id}` );

});
