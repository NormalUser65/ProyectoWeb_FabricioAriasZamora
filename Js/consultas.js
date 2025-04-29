// Función para mostrar mensajes al usuario en el formulario.
// Recibe el mensaje a mostrar y un booleano indicando si el mensaje es de éxito (verde) o error (rojo).
function showMessage(message, isSuccess = false) {
  const messageElement = document.getElementById('formMessage');
  messageElement.textContent = message;
  // Remove todas las clases de alerta previas y la clase 'd-none'.
  messageElement.classList.remove('d-none', 'alert-success', 'alert-danger');
  // Añade la clase de alerta correspondiente según el parámetro 'isSuccess'.
  messageElement.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
}

// Función para calcular la edad basada en la fecha de nacimiento seleccionada.
function calculateAge() {
  const fechaNacimiento = new Date(this.value);
  // Si la fecha de nacimiento no es válida, la función termina.
  if (isNaN(fechaNacimiento.getTime())) return;

  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();

  // Ajusta la edad si el mes de nacimiento es posterior al mes actual,
  // o si es el mismo mes pero el día de nacimiento es posterior al día actual.
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
  }

  // Actualiza el valor del campo de edad en el formulario.
  document.getElementById('edad').value = edad;
}

// Función asíncrona para enviar el formulario de consulta por correo electrónico.
async function sendEmail(e) {
  e.preventDefault(); 

  // --- Obtención de elementos del DOM ---
  const form = document.getElementById('consultaForm');
  const submitBtn = document.getElementById('submitBtn');
  const originalBtnText = submitBtn.innerHTML;

  // --- Validación del campo de género ---
  const generoSeleccionado = document.querySelector('input[name="genero"]:checked');

  if (!generoSeleccionado) {
      showMessage('Por favor seleccione un género');
      return;
  }

  // --- Mostrar estado de carga en el botón ---
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
  submitBtn.disabled = true; // Deshabilita el botón para evitar envíos múltiples.

  try {
      // --- Obtener los grados académicos seleccionados ---
      const gradosAcademicos = document.querySelectorAll('input[name="gradoAcademico"]:checked');
      // Mapea los valores de los checkboxes seleccionados de grados académicos a un array
      // y los une en una cadena separada por comas. Si no se selecciona ninguno, se indica.
      const gradosSeleccionados = gradosAcademicos.length > 0
          ? Array.from(gradosAcademicos).map(el => el.value).join(', ')
          : 'No especificado';

      // --- Preparación de los datos del formulario para el envío por correo ---
      const formData = {
          email: document.getElementById('email').value,
          nombre: document.getElementById('nombre').value,
          edad: document.getElementById('edad').value,
          genero: generoSeleccionado.value,
          grado_academico: gradosSeleccionados,
          consulta: document.getElementById('consulta').value,
          // Obtiene la fecha y hora actual formateada para Costa Rica.
          fecha_envio: new Date().toLocaleString('es-CR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          })
      };

      // --- Envío del correo electrónico utilizando EmailJS ---
      const response = await emailjs.send(
          'service_9rbrn2c',   // Service ID proporcionado por EmailJS
          'template_pem55cb',   // Template ID del correo electrónico en EmailJS
          formData             // Objeto con los datos a enviar
      );

      // Si el envío es exitoso, muestra un mensaje de éxito y resetea el formulario.
      showMessage('¡Consulta enviada con éxito! Nos pondremos en contacto pronto.', true);
      form.reset();

  } catch (error) {
      console.error('Error al enviar:', error);
      showMessage('Hubo un error al enviar la consulta. Por favor inténtalo de nuevo.');
  } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
  }
}

// --- Inicialización de eventos cuando el DOM está completamente cargado ---
document.addEventListener('DOMContentLoaded', function() {
  // --- Configurar el evento 'change' para el campo de fecha de nacimiento ---
  const fechaNacimiento = document.getElementById('fechaNacimiento');
  fechaNacimiento.addEventListener('change', calculateAge); // Llama a calculateAge al cambiar la fecha.

  // --- Configurar el evento 'submit' para el formulario de consulta ---
  const consultaForm = document.getElementById('consultaForm');
  consultaForm.addEventListener('submit', sendEmail); // Llama a sendEmail al enviar el formulario.
});