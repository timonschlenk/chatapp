const PORT = 3000; // Sets the output port

const mysql = require('mysql');
const express = require("express");
const session = require('express-session');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//all written messages are stored in here
var messages = new Array();
//all logged in users are stored in here with their ip address as 
var users = new Map();
//all connected ip adresses
var IPsConnected = new Array();

//create conncection to database
const databaseConnection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'login'
});

//something database releated
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// linking link to according html file
const pages = [{ url: "/login", file: "/public/LogIn/index.html" },
               { url: "/signup", file: "/public/SignUp/index.html" },
               { url: "/signup-success", file: "/public/SignUp/userCreated.html"},
               { url: "/home", file: "/public/write/index.html" }];

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
  IPsConnected.push(socket.handshake.address)
  io.to(socket.id).emit("previous messages", messages);

  socket.on("message", (message) => {
    io.emit("message", message);
    messages.push(message);
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

    databaseConnection.query(checkExistingUsername, function(error1, user){
        if (error1) throw error1;
        if(user.length === 0){
          databaseConnection.query(checkExistingEmail, function(error2, email){
                if (error2) throw error2;
                if(email.length === 0){
                  databaseConnection.query(insertData, [data.username, data.password, data.email], function(error3, results) {
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
    
    let getPassword = `SELECT password FROM accounts WHERE username = "${data.username}"`;

    databaseConnection.query(getPassword, function(error, password){
        if (error) throw error;
        pwdLength = password.length;
        if (pwdLength === 0){
          console.log("login false");
          io.to(socket.id).emit('error', 'Error: Username or Password is incorrect');
        } else if (password[0].password === data.password){
          io.to(socket.id).emit('successful', true);
          users.set(socket.handshake.address, data.username);
        } else {
          console.log("login false");
          io.to(socket.id).emit('error', 'Error: Username or Password is incorrect');
        };
    });
  });

  socket.on("getUser", (loadHome) => {
    if(loadHome){
      let ip = socket.handshake.address;
      console.log(users);
      console.log(ip);
      console.log(users.has(ip));
      if(users.has(socket.handshake.address)){
        io.to(socket.id).emit("userInformation", {exists: true, username: users.get(socket.handshake.address)});
      } else {
        io.to(socket.id).emit("userInformation", {exists: false, username: false});
      }
    }
  });

  socket.on("userConnection", (user) => {
    
  });

  // 'disconnect' is build in event
  socket.on("disconnect", () => {
    let ip = socket.handshake.address;
    IPsConnected.splice(IPsConnected.indexOf(ip), 1);

    setTimeout(() => {
      console.log(IPsConnected.indexOf(ip) != -1);
      if(IPsConnected.indexOf(ip) == -1){
        users.delete(ip);
      }
    }, 10000);
  });
});
