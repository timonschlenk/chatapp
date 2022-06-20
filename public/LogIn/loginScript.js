var socket = io();

var password, user;

// execute when form submitet and password + user != null)
socket.emit("controlPassword", {user: user, password: password});

//receive after server controlled password (possible redirection)
socket.on("controlPassword", (controlPassword) => {
    if(controlPassword){
        //password was true - redirect to write
    } else {
        //password was false - error message
    }
});
