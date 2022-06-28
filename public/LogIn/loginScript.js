var socket = io();

const form = document.getElementById('form');
const error = document.getElementById('error');

socket.on('successful', (data) => {
    window.location.href = '/signup-success';
});

socket.on('error', (errorMsg) => {
    error.innerHTML = errorMsg;
});


form.addEventListener('submit', (event) => {
    //stops form from submitting ?
    event.preventDefault();

    //forms.elements[id] can access the input elements of the form
    let email = form.elements['email'].value;
    let username = form.elements['username'].value;
    let password = form.elements['password'].value;
    let confirm = form.elements['confirm'].value;

    let errorMSG = false;


    if(checkPassword(password, confirm)){
        if(checkUsername(username)){
            if(checkEmail(email)){
                errorMSG = "";
                socket.emit('createUser', {email: email, username: username, password: password});
            }  else {
                errorMSG = "Error: Your email is invalid (Emails have to be in a valid email format and can max have 100 characters)"
            }
        } else {
            errorMSG = "Error: Your username is invalid (Usernames must have min 3 and max 50 characters)"
        }
    } else {
        errorMSG = "Error: Your passwords are invalid (Passwords must have min 8 and max 255 characters. Both passwords have to be the same)"
    }

    error.innerHTML = errorMSG;

});