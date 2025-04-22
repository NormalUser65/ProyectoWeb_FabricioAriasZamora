// Función de mensajes en el formulario
function showMessage(message, isSuccess = false) {
    const messageElement = document.getElementById('formMessage');
    messageElement.textContent = message;
    messageElement.classList.remove('d-none', 'alert-success', 'alert-danger');
    messageElement.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
  }
  
  // Calculo de edad basado en la fecha de nacimiento
  function calculateAge() {
    const fechaNacimiento = new Date(this.value);
    if (isNaN(fechaNacimiento.getTime())) return;
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    
    document.getElementById('edad').value = edad;
  }
  
  // Envio de formulario
  async function sendEmail(e) {
    e.preventDefault();
    
    // Obtención de elementos
    const form = document.getElementById('consultaForm');
    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.innerHTML;
    
    // Validación
    const generoSeleccionado = document.querySelector('input[name="genero"]:checked');
    
    if (!generoSeleccionado) {
      showMessage('Por favor seleccione un género');
      return;
    }
  
    // Mostrar estado de carga
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
    submitBtn.disabled = true;
  
    try {
      // Obtener grados académicos
      const gradosAcademicos = document.querySelectorAll('input[name="gradoAcademico"]:checked');
      const gradosSeleccionados = gradosAcademicos.length > 0 
        ? Array.from(gradosAcademicos).map(el => el.value).join(', ')
        : 'No especificado';
  
      // Preparación de los datos
      const formData = {
        email: document.getElementById('email').value,
        nombre: document.getElementById('nombre').value,
        edad: document.getElementById('edad').value,
        genero: generoSeleccionado.value,
        grado_academico: gradosSeleccionados,
        consulta: document.getElementById('consulta').value,
        fecha_envio: new Date().toLocaleString('es-CR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
  
      const response = await emailjs.send(
        'service_9rbrn2c',   // Service ID
        'template_pem55cb',  // Template ID
        formData
      );
  
      showMessage('¡Consulta enviada con éxito! Nos pondremos en contacto pronto.', true);
      form.reset();
      
    } catch (error) {
      console.error('Error al enviar:', error);
      showMessage('Hubo un error al enviar la consulta. Por favor inténtalo de nuevo.');
    } finally {
      // Restaurar botón
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  }
  
  // Inicialización cuando el DOM está cargado
  document.addEventListener('DOMContentLoaded', function() {
    // Configurar evento para la fecha de nacimiento
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    fechaNacimiento.addEventListener('change', calculateAge);
    
    // Configurar evento para el formulario
    const consultaForm = document.getElementById('consultaForm');
    consultaForm.addEventListener('submit', sendEmail);
  });