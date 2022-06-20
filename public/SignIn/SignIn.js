var socket = io();

var password, user;

// execute when form submitet and password + user != null)
socket.emit("createUser", {user: user, password: password});