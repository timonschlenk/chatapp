var socket = io();

const form = document.getElementById('form');
const error = document.getElementById('error');

socket.on('successful', (data) => {
    window.location.href = '/home';
});

socket.on('error', (errorMsg) => {
    error.innerHTML = errorMsg;
});


form.addEventListener('submit', (event) => {
    //stops form from submitting ?
    event.preventDefault();

    //forms.elements[id] can access the input elements of the form
    let username = form.elements['username'].value;
    let password = form.elements['password'].value;

    socket.emit('checkUser', {username: username, password: password});

});