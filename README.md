# chatapp

## Feature explanation

### Starting and updating the server

All of the scripts that are run on the server are in server.js, to start the server run "node server" in the Terminal, to stop it press CTRL+C in the Terminal. Whenever you console.log something in the server.js file, it will be displayed in the Terminal.

Adittionally we need to have a database running to store all login values, even when the server is down. To start the database download the XAMPP Control Panel from https://www.apachefriends.org/de/index.html, then open it and start the MySQL server.
Now open VS Code and download the extension MySQL by Weijan Chen, open the extension and click "Create Connection". In the pop-up window click on "Create" keeping the standard values. Now that you connected VS Code with your database we have to initialize a table to store our data in.
For that we use the language SQL. Navigate to database.sql in your project files and execute the entire program by clicking on the Execute button over every part of the script.
Now if you click on your Add-On again you'll see the entry: 127.0.0.1@3306, that's the IP adress with the Port the Database is running on. Now in your extension tab navigate to 127.0.0.1@3306 > login > tables > accounts and hover over accounts. You'll see a burger menu symbol which when you click it, it will open a visualisation for the table you created with all the entries in it (for now only one with id=1, username=test, password=test, email=test@test.com)

Whenever you make changes to server.js, you have to stop and restart your server in the Terminal, for the changes to apply.
You never have to restart the database. If you stop the XAMPP server, and restart it again, the table data will still be saved.
After having made changes on the client side, you don't have to restart the server but just have to save them and reload your page for them to apply.
Your server is now running and good to go.

To access the server if you are hosting it type: http://localhost:3000/home. 
To access the server if you are in the same network as the server type: http://IPaddressServer:3000/home

### The server.js file

#### Server and Database configuration

First we need to require all kinds of libarys for our server to work. The object **app** is responible for all node.js actions and the object **io** for all the socket.io actions. Socket.io is just a libary for node.js to make the code for communication between server and client easier to write. You could technically only use node.js, but this would be harder to write and less efficciant.
```javascript
const mysql = require('mysql');
const express = require("express");
const session = require('express-session');
const app = express(); //object we use for pure node.js actions
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server); //object we use for socket.io actions
const path = require("path");
```

Then with the following piece of code, we create a conncection to the database. To manipulate the database use the object databaseConnection.
```javascript
const databaseConnection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'login'
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
```

This line is just some code copied from Stack Overflow, to solve an error. Otherwise the program would misinterpret CSS and JavaScript files linked in your HTML as Text files.
```javascript
const path = require("path");app.use("/public", express.static(path.join(__dirname, "public")));
```

Here we make navigating on our server cleaner and easier. The code does that if you enter domain/"url" in your browser the HTML file "file" will be loaded. So instead of having to enter domain/public/LogIn/index.html to get to the login page, you just have to enter domain/login.
```javascript
const pages = [{ url: "/login", file: "/public/LogIn/index.html" },
               { url: "/signup", file: "/public/SignUp/index.html" },
               { url: "/signup-success", file: "/public/SignUp/userCreated.html"},
               { url: "/home", file: "/public/write/index.html" }];

pages.forEach((page) => {
  app.get(page.url, (req, res) => {
    res.sendFile(`${__dirname}${page.file}`);
  });
});
```

And now we start our server on the port "PORT" (in our case 3000).
```javascript
server.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
```


#### Communication between server and client with socket.io

Let's walk our way through the socket.io part step by step. After our server and database is set up, we start by writing:
```javascript
io.on("connection", (socket) => {
  //code
});
```
This function is called by socket.io whenever a client connects with the server. The argument **socket** contains important data about the client like an unique id used to communicate with the client (socket.id) and the clients ip address (socket.handshake.address). In this function we write code that is called once upon connection, but also listener functions, that will be called later in time.

The following code is the code executed once and what it does is adding the clients ip address to an array, where all connected ip adresses are stored. As well as emitting (sending) a message to the client with the id: socket.id (so the one that just connected), with the all the messages that have already been written, stored in the array messages.
```javascript
IPsConnected.push(socket.handshake.address);
io.to(socket.id).emit("previous messages", messages);
```
Thus the Syntax to send messages to clients is:
  1. If you want to send it to all clients: **io.emit("message name", messageData);**
  2. If you want to send to send it to a specific client **io.to(socketId).emit("message name", messageData);**

The rest of the code is about receiving messages from the client and answering those. We write listener functions with the syntax:
```javascript
socket.on("message name", (messageData) => {
  //response to message
});
```
and if we want to send something back to the client, who send us the message, we can once again use our socket.id:
```javascript
socket.on("message name", (messageData) => {
  io.emit("message to all users", messageData);
  io.to(socket.id).emit("message to the one that sent", "message received")
});
```
This code would send the message received from one client to everybody and send the one client a conformation, that the message was received.

So now let's look at some of the implemented **socket.on** functions and their Syntax.

The first one is simple: When we receive the message "message" from our client we send the data **message** to everybody and add it to our **messages** array. So when one client writes something, every client get's the message (including the one who wrote it) and **messages** is the array that every client receives upon connection, so that he can see all the messages written so far.
```javascript
socket.on("message", (message) => {
  io.emit("message", message);
  messages.push(message);
});
```

The next one's are a bit harder, because they include communication with the database.
Let's just shortly explain that monster, that follows:
```javascript
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
                      io.to(socket.id).emit('successful', true);
                  });
              }else{  
                  io.to(socket.id).emit('error', 'Error: A User is already registered with this email');
              }
          });
      }else{  
          io.to(socket.id).emit('error', 'Error: The Username is already taken');
      }
  });
});
```
We have to create a user and add it to our database. so first we check, if they username or email already exists. For that we receive a username, a password and an email as data from the client. Now in the next three variables, we have some SQL code, the language used to manipulate databases. And they do exactly what they are called. Insert Data inserts 3 values in our accounts table, check Existing Username returns us the ID of the username and email the ID of the email.

The Syntax is fot this is:
```javascript
databaseConnection.query(SQLString, function(errorMessage, returnValues){
  if (errorMessage) throw errorMessage; //to print out the error Message
  //execute Code and use returnValues
}
```

With that knowledge, we can understand, how the server.js file works. There is only one thing left, which is a function executed when the user disconnects with the Syntax:
```javascript
socket.on("disconnect", () => {
  //code when disconnecting like cleaning up to save storage
});
```

#### The disconnect/reconnect issue

Whenever you switch page, for example from /login to /home, the client disconnects and reconnects from the server, therefore has a new socket.id. To know wether it's still the same user, we use the users IP adress. But an IP adress can change, so we can't purly rely on IP adresses to identify users. What we do is save the IP address in an array, when a user connects. If he disconnects we wait ten secounds until we remove the IP, so when logging in and therefore switching page we use the IP adress to track wether you are logged in or not and the moment you reconnect, you stay logged in on /home.

### The client side

To use socket.io use the following Syntax at the beginning of the file:
```javascript
socket = io();
```

To send messages to the server use:
```javascript
socket.emit("message name", data);
```

To receive messages use:
```javascript
socket.on("message name", (data) => {
  //code exeuted when message received
});
```