const PORT = 3000; // Sets the output port

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const pages = [ { url: "/write", file: "/public/write/index.html"}, 
                { url: "/read", file: "/public/read/index.html"} ]

var messages = new Array();
var users = new Map();

//necsessairy to load script and css files without type mismatch even if in right path
const path = require('path');
app.use('/public', express.static(path.join(__dirname, "public")));

//links the right html for each url
pages.forEach( page => {
    app.get(page.url, (req, res) => {
        res.sendFile(`${__dirname}${page.file}`);
    });
});

//creates server on localhost:PORT
server.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});

//important stuff happens here
//get executed when client creates instance of io()
io.on('connection', (socket) => {
    console.log(`a user connected with id: ${socket.id}`);
    io.to(socket.id).emit('previous messages', messages);
    users.set(socket.id, 'Anonymous');

    socket.on('message', (message) => {
        io.emit('message', message);
        messages.push(message);
        users.set(socket.id, message.username);
    });

    // 'disconnect' is build in event
    socket.on('disconnect', () => {
        let message = {username: false, message:`*${users.get(socket.id)} disconnected*`};
        io.emit('disconnect message', message);
        messages.push(message);
        users.delete(socket.id);

        console.log(message.message);
    });
});
