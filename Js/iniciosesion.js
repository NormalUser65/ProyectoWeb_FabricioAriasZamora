document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const loginForm = document.getElementById('loginFormElement');
  const registerForm = document.getElementById('registerFormElement');
  const showRegisterLink = document.getElementById('showRegister');
  const showLoginLink = document.getElementById('showLogin');
  const loginSection = document.getElementById('loginForm');
  const registerSection = document.getElementById('registerForm');
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');

  // Cambiar entre login y registro
  showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
  });

  showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
  });

  // Toggle para mostrar/ocultar contraseña
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
      const icon = this.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    });
  });

  // Manejar el registro de nuevos usuarios
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = $('#registerName').val().trim(); // Usando jQuery
    const email = $('#registerEmail').val().trim(); // Usando jQuery
    const password = $('#registerPassword').val(); // Usando jQuery
    const confirmPassword = $('#registerConfirmPassword').val(); // Usando jQuery

    // Validaciones
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Verificar si el usuario ya existe
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.email === email);

    if (userExists) {
      alert('Este correo electrónico ya está registrado');
      return;
    }

    // Registrar nuevo usuario
    const newUser = {
      name,
      email,
      password // En una aplicación real, esto debería estar hasheado
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registro exitoso! Ahora puedes iniciar sesión');
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';

    // Limpiar el formulario
    registerForm.reset();
  });

  // Manejar el inicio de sesión
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = $('#loginEmail').val().trim(); // Usando jQuery
    const password = $('#loginPassword').val(); // Usando jQuery

    // Verificar credenciales
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
      // Crear sesión temporal (no persistente)
      sessionStorage.setItem('currentUser', JSON.stringify({
        email: user.email,
        name: user.name,
        timestamp: new Date().getTime()
      }));

      // Redirigir al home
      window.location.href = 'home.html';
    } else {
      alert('Correo electrónico o contraseña incorrectos');
    }
  });

  // Verificar si hay una sesión activa al cargar la página
  // (para evitar que alguien entre directamente a home.html sin login)
  // Esto debería estar en home.html, pero lo menciono como nota
});