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

To access the server if you are hosting it type: http://localhost:3000/home
To access the server if you are in the same network as the server type: http://IPaddressServer:3000/home

### The server.js file

#### Server and Database configuration

First we need to require all kinds of libarys for our server to work. The object **app** is responible for all node.js actions and the object **io** for all the socket.io actions. Socket.io is just a libary for node.js to make the code for communication between server and client easier to write. You could technically only use node.js, but this would be harder to write and less effective.
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

Here we make navigating on our server cleaner and easier. The code makes that if you enter domain/"url" in your browser the HTML file "file" will be loaded. So instead of having to enter domain/public/LogIn/index.html to get to the login page, you just have to enter domain/login.
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
