document.addEventListener('DOMContentLoaded', function() {
  // --- Elementos del DOM ---
  // Se obtienen referencias a los elementos del formulario de login, registro y los enlaces para cambiar entre ellos.
  const loginForm = document.getElementById('loginFormElement');
  const registerForm = document.getElementById('registerFormElement');
  const showRegisterLink = document.getElementById('showRegister');
  const showLoginLink = document.getElementById('showLogin');
  const loginSection = document.getElementById('loginForm');
  const registerSection = document.getElementById('registerForm');
  // Se obtienen todos los botones que se utilizarán para mostrar u ocultar la contraseña.
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');

  // --- Cambiar entre las secciones de Login y Registro ---
  // Evento para mostrar el formulario de registro al hacer clic en el enlace "Registrarse".
  showRegisterLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginSection.style.display = 'none';
      registerSection.style.display = 'block';
  });

  // Evento para mostrar el formulario de login al hacer clic en el enlace "Iniciar Sesión".
  showLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      registerSection.style.display = 'none';
      loginSection.style.display = 'block';
  });

  // --- Funcionalidad para mostrar/ocultar la contraseña ---
  togglePasswordButtons.forEach(button => {
      button.addEventListener('click', function() {
          // Obtiene el input de contraseña asociado al botón.
          const input = this.parentElement.querySelector('input');
          const icon = this.querySelector('i');

          // Si el tipo de input es 'password' (oculto)...
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

  // --- Manejar el registro de nuevos usuarios ---
  // Evento que se dispara al enviar el formulario de registro.
  registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Se obtienen los valores de los campos del formulario de registro utilizando jQuery.
      const name = $('#registerName').val().trim();
      const email = $('#registerEmail').val().trim();
      const password = $('#registerPassword').val();
      const confirmPassword = $('#registerConfirmPassword').val();

      // --- Validaciones del formulario de registro ---
      // Verifica si las contraseñas ingresadas coinciden.
      if (password !== confirmPassword) {
          alert('Las contraseñas no coinciden');
          return;
      }

      // Verifica si la longitud de la contraseña es menor a 6 caracteres.
      if (password.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres');
          return;
      }

      // --- Verificar si el usuario ya existe ---
      // Se obtienen los usuarios almacenados en el localStorage, o un array vacío si no hay ninguno.
      const users = JSON.parse(localStorage.getItem('users')) || [];
      // Se verifica si ya existe un usuario con el mismo correo electrónico.
      const userExists = users.some(user => user.email === email);

      if (userExists) {
          alert('Este correo electrónico ya está registrado');
          return; 
      }

      // --- Registrar el nuevo usuario ---
      // Se crea un objeto con la información del nuevo usuario.
      const newUser = {
          name,
          email,
          password
      };

      // Se añade el nuevo usuario al array de usuarios.
      users.push(newUser);
      // Se guarda el array actualizado de usuarios en el localStorage.
      localStorage.setItem('users', JSON.stringify(users));

      alert('Registro exitoso! Ahora puedes iniciar sesión');
      registerSection.style.display = 'none'; // Oculta la sección de registro.
      loginSection.style.display = 'block'; // Muestra la sección de login.

      // Limpia los campos del formulario de registro.
      registerForm.reset();
  });

  // --- Manejar el inicio de sesión ---
  // Evento que se dispara al enviar el formulario de inicio de sesión.
  loginForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Evita el envío por defecto del formulario.

      // Se obtienen los valores de los campos del formulario de inicio de sesión utilizando jQuery.
      const email = $('#loginEmail').val().trim();
      const password = $('#loginPassword').val();

      // --- Verificar las credenciales del usuario ---
      // Se obtienen los usuarios almacenados en el localStorage, o un array vacío si no hay ninguno.
      const users = JSON.parse(localStorage.getItem('users')) || [];
      // Se busca un usuario que coincida con el correo electrónico y la contraseña ingresados.
      const user = users.find(user => user.email === email && user.password === password);

      if (user) {
          // --- Crear una sesión temporal ---
          // Se guarda información del usuario actual en el sessionStorage.
          // Los datos en sessionStorage se eliminan cuando se cierra la pestaña o el navegador.
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