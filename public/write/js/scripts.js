var socket = io(); //joins the server

form = document.getElementById('form');
usernameInput = document.getElementById('username');
messageInput = document.getElementById('input');
messages = document.getElementById('messages');

form.addEventListener('submit', (element) => {
    element.preventDefault();
    if (messageInput.value){
        if (!usernameInput.value){
            socket.emit("message", { username: "Anonymous", message: messageInput.value});
        } else {
            socket.emit("message", { username: usernameInput.value, message: messageInput.value});
        }
        messageInput.value = "";
        
    }
});

socket.on('message', (message) => {
    addMessage(message);
});

socket.on('previous messages', (messages) => {
    messages.forEach( (message) => {
        addMessage(message);
    })
});

socket.on('disconnect message', (text) => {
    addMessage(text, false);
});

function addMessage(message, username = true){
    let item = document.createElement('li');
    if(username){
        item.textContent =  `${message.username}: ${message.message}`;
    } else {
        item.textContent =  message;
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}