form = document.getElementById('form');
usernameInput = document.getElementById('username');
messageInput = document.getElementById('input');
messages = document.getElementById('messages');

form.addEventListener('submit', (element) => {
    element.preventDefault();
    if (messageInput.value){
        //send message: "message" with value {username: "string", message: "string"} using information of the form to server
        if (!usernameInput.value){
            socket.emit("message", { username: "Anonymous", message: messageInput.value});
        } else {
            socket.emit("message", { username: usernameInput.value, message: messageInput.value});
        }
        //reset message input
        messageInput.value = "";
        
    }
});