//creates socket and new client
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

function checkEmail(input) {
	// check if the value is not empty
	if (!input) {
		return false;
	}
	// validate email format
	const emailRegex =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	const email = input.trim();
	if (!emailRegex.test(email)) {
		return false;
	}

    //check if under 100 characters
    if (input.length >= 100){
        return false;
    }

    //else return true
	return true;
}

function checkPassword(password, confirm){
    if (password === confirm  && password.length <= 255 && password.length >= 8){
        return true;
    } else {
        return false;
    }
}

function checkUsername(username){
    if (username.length >= 3 && username.length <= 50){
        return true;
    } else {
        return false;
    }
}