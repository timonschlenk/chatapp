var socket = io(); //joins the server
var user;

const username = document.getElementById("username");

socket.emit("getUser", (true));
socket.on("userInformation", (user) => {
    console.log(user);
    if (!user.exists){
        window.location.href = '/login';
    } else {
        socket.emit("userConnection", user);
        username.innerHTML = user.username;
    }
});

//executed when receiving message: 'message' with the content (message)
socket.on('message', (message) => {
    addMessage(message); //add message consisting of Username and Message
});

//executed when receiving message: 'previous messages' with the content (messages) to ul
socket.on('previous messages', (messages) => {
    messages.forEach( (message) => {
        addMessage(message); //add every previous message to ul
    })
});

//executed when receiving message: 'disconnect message' with the content (message)
socket.on('conncetion message', (message) => {
    addMessage(message); //add disconnect disconnect message consisting of Username = false and DisconnectMessage to ul
});

// message = {username: "string"/false, message: "string"}
function addMessage(message){
    let item = document.createElement('li');
    if(message.username !== false){
        item.textContent =  `${message.username}: ${message.message}`;
    } else {
        item.textContent =  message.message;
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}