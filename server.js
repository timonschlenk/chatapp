const PORT = 3000; // Sets the output port

const mysql = require('mysql');
const express = require("express");
const session = require('express-session');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// linking link to according html file
const pages = [{ url: "/login", file: "/public/LogIn/index.html" },
               { url: "/signup", file: "/public/SignUp/index.html" },
               { url: "/signup-success", file: "/public/SignUp/userCreated.html" }
               { url: "/home", file:"/public/LogIn/"}];


const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'login'
});

var messages = new Array();
var users = new Map();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//necessairy to load script and css files without type mismatch even if in right path
const path = require("path");
app.use("/public", express.static(path.join(__dirname, "public")));

//links the right html for each url
pages.forEach((page) => {
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
io.on("connection", (socket) => {
  console.log(`a user connected with id: ${socket.id}`);
  io.to(socket.id).emit("previous messages", messages);
  users.set(socket.id, "Anonymous");

  socket.on("message", (message) => {
    io.emit("message", message);
    messages.push(message);
    users.set(socket.id, message.username);
  });

  // 'disconnect' is build in event
  socket.on("disconnect", () => {
    let message = {
      username: false,
      message: `*${users.get(socket.id)} disconnected*`,
    };
    io.emit("disconnect message", message);
    messages.push(message);
    users.delete(socket.id);

    console.log(message.message);
  });

  socket.on("controlPassword", (data) => {
    if(accounts.get(data.user) == data.password){
        io.to(socket.id).emit("passwordCorrect", true);
    } else {
        io.to(socket.id).emit("passwordCorrect", false);
    }
  });

  socket.on("createUser", (data) => {
    //data includes data.username, data.password and data.email
    let insertData = "INSERT INTO accounts (username, password, email) VALUES (?, ?, ?);";
    let checkExistingUsername = `SELECT id FROM accounts WHERE username = "${data.username}";`
    let checkExistingEmail = `SELECT id FROM accounts WHERE email = "${data.email}";`

    connection.query(checkExistingUsername, function(error1, user){
        if (error1) throw error1;
        if(user.length === 0){
            connection.query(checkExistingEmail, function(error2, email){
                if (error2) throw error2;
                if(email.length === 0){
                    connection.query(insertData, [data.username, data.password, data.email], function(error3, results) {
                        if (error3) throw error3;
                        console.log('user created');
                        io.to(socket.id).emit('successful', true);
                    });
                }else{  
                    console.log("email exists")
                    io.to(socket.id).emit('error', 'Error: A User is already registered with this email');
                }
            });
        }else{  
            console.log("user exists")
            io.to(socket.id).emit('error', 'Error: The Username is already taken');
        }
    });
  });

  socket.on("checkUser", (data) => {
    //data includes data.username, data.password and data.email
    
    let getPassword = `SELECT password FROM accounts WHERE username = "${data.username}" OR email = "${data.email}";`;

    connection.query(getPassword, function(error, password){
        if (error) throw error;
        if(password === `${data.password}`){
            io.to(socket.id).emit('successful', true);
        } else {
            console.log("login false");
            io.to(socket.id).emit('error', 'Error: Username or Password is wrong');
        }
    });
  });
});
