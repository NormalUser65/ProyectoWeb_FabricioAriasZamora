$(document).ready(function () {
    // --- Elementos del DOM ---
    const loginForm = $('#loginFormElement');
    const registerForm = $('#registerFormElement');
    const showRegisterLink = $('#showRegister');
    const showLoginLink = $('#showLogin');
    const loginSection = $('#loginForm');
    const registerSection = $('#registerForm');
    const togglePasswordButtons = $('.toggle-password');

    // --- Cambiar entre las secciones de Login y Registro ---
    showRegisterLink.on('click', function (e) {
        e.preventDefault();
        loginSection.hide();
        registerSection.show();
    });

    showLoginLink.on('click', function (e) {
        e.preventDefault();
        registerSection.hide();
        loginSection.show();
    });

    // --- Funcionalidad para mostrar/ocultar la contraseña ---
    togglePasswordButtons.each(function () {
        $(this).on('click', function () {
            const input = $(this).siblings('input');
            const icon = $(this).find('i');

            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                icon.removeClass('bi-eye').addClass('bi-eye-slash');
            } else {
                input.attr('type', 'password');
                icon.removeClass('bi-eye-slash').addClass('bi-eye');
            }
        });
    });

    // --- Manejar el registro de nuevos usuarios ---
    registerForm.on('submit', function (e) {
        e.preventDefault();

        const name = $('#registerName').val().trim();
        const email = $('#registerEmail').val().trim();
        const password = $('#registerPassword').val();
        const confirmPassword = $('#registerConfirmPassword').val();

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.email === email);

        if (userExists) {
            alert('Este correo electrónico ya está registrado');
            return;
        }

        const newUser = {
            name,
            email,
            password
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('Registro exitoso! Ahora puedes iniciar sesión');
        registerSection.hide();
        loginSection.show();
        registerForm[0].reset(); // reset jQuery object
    });

    // --- Manejar el inicio de sesión ---
    loginForm.on('submit', function (e) {
        e.preventDefault();

        const email = $('#loginEmail').val().trim();
        const password = $('#loginPassword').val();

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                name: user.name,
                timestamp: new Date().getTime()
            }));
            window.location.href = 'home.html';
        } else {
            alert('Correo electrónico o contraseña incorrectos');
        }
    });
});
