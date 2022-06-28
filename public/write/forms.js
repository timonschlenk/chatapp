const form = document.getElementById('form');
const messageInput = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (element) => {
    element.preventDefault();
    if (messageInput.value){
        //send message: "message" with value {username: "string", message: "string"} using information of the form to server
        socket.emit("message", { username: username.innerHTML, message: messageInput.value});
        //reset message input
        messageInput.value = "";
        
    }
});