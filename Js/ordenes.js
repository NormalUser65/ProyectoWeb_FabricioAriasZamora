// Inicialización de EmailJS con la clave de usuario.
// Esto permite la conexión con el servicio de envío de correos.
emailjs.init('x9v1X4yhNQnAg4_uv');

// Este evento asegura que el código dentro se ejecute solo después de que
// el DOM (Document Object Model) esté completamente cargado y listo para ser manipulado.
document.addEventListener('DOMContentLoaded', function() {
    // Se obtiene el carrito de compras almacenado en el localStorage.
    // Si no existe 'carritoCheckout', se inicializa como un array vacío.
    const carrito = JSON.parse(localStorage.getItem('carritoCheckout')) || [];

    // Se obtienen referencias a elementos del DOM que se utilizarán.
    const resumenCarrito = document.getElementById('resumen-carrito');
    const formulario = document.getElementById('formulario-pedido');
    const fechaNacimientoInput = document.querySelector('input[name="fecha_nacimiento"]');

    // --- Validación de la edad del usuario ---
    // Se agrega un listener al campo de fecha de nacimiento para validar la edad cuando cambia.
    fechaNacimientoInput.addEventListener('change', function() {
        const fechaNacimiento = new Date(this.value);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();

        // Se ajusta la edad si el mes de nacimiento es posterior al mes actual,
        // o si es el mismo mes pero el día de nacimiento es posterior al día actual.
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }

        // Si la edad es menor de 18 años, se añade una clase de error al input
        // y se muestra una alerta SweetAlert informando al usuario.
        if (edad < 18) {
            this.classList.add('is-invalid');
            Swal.fire({
                title: 'Edad no válida',
                text: 'Debes ser mayor de 18 años para realizar compras.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        } else {
            // Si la edad es válida, se remueve la clase de error del input.
            this.classList.remove('is-invalid');
        }
    });

    // --- Mostrar el resumen del carrito de compras ---
    // Si el carrito está vacío, se muestra un mensaje indicando que no hay productos
    // y se oculta el formulario de pedido.
    if (carrito.length === 0) {
        resumenCarrito.innerHTML = '<div class="alert alert-warning">No hay productos en el carrito. <a href="index.html">Volver a la tienda</a></div>';
        formulario.style.display = 'none';
        return; // Se detiene la ejecución si el carrito está vacío.
    }

    // Si el carrito tiene productos, se genera una tabla HTML para mostrar el resumen.
    resumenCarrito.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${carrito.map(item => `
                        <tr>
                            <td>${item.nombre}</td>
                            <td>${item.cantidad}</td>
                            <td>₡${item.precio.toLocaleString('es-CR')}</td>
                            <td>₡${(item.precio * item.cantidad).toLocaleString('es-CR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot class="table-group-divider">
                    <tr>
                        <th colspan="3" class="text-end">Total:</th>
                        <th>₡${carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toLocaleString('es-CR')}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    // --- Envío del correo electrónico al confirmar el pedido ---
    // Se agrega un listener al formulario para capturar el evento de envío.
    formulario.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita el comportamiento de envío por defecto del formulario.

        // --- Validación de edad al enviar el formulario (redundante como precaución) ---
        const fechaNacimiento = new Date(this.fecha_nacimiento.value);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }

        if (edad < 18) {
            Swal.fire({
                title: 'Edad no válida',
                text: 'Debes ser mayor de 18 años para realizar compras.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return; // Detiene el envío si la edad no es válida.
        }

        // --- Deshabilitar el botón de envío y mostrar un indicador de carga ---
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';

        // --- Formatear el número de tarjeta para mostrar solo los últimos 4 dígitos ---
        const numeroTarjeta = this.numero_tarjeta.value;
        const tarjetaOculta = '**** **** **** ' + numeroTarjeta.slice(-4);

        // --- Crear el objeto con los datos del correo electrónico ---
        const datosCorreo = {
            nombre: this.nombre.value,
            telefono: this.telefono.value,
            direccion: this.direccion.value,
            notas: this.notas.value,
            tipo_tarjeta: this.tipo_tarjeta.value,
            tarjeta: tarjetaOculta,
            expiracion: this.expiracion_tarjeta.value,
            // Mapear los productos del carrito a un formato HTML para el correo.
            productos: carrito.map(item =>
                `<div style="margin-bottom: 15px;">
                    <strong>${item.nombre}</strong><br>
                    • Cantidad: ${item.cantidad}<br>
                    • Precio unitario: ₡${item.precio.toLocaleString('es-CR')}<br>
                    • Subtotal: ₡${(item.precio * item.cantidad).toLocaleString('es-CR')}
                </div>`
            ).join(''),
            // Calcular el total del carrito y formatearlo.
            total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toLocaleString('es-CR'),
            // Obtener la fecha y hora actual formateada para Costa Rica.
            fecha_hora: new Date().toLocaleString('es-CR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // --- Enviar el correo electrónico utilizando EmailJS ---
        emailjs.send("service_9rbrn2c", "template_la5dfju", datosCorreo)
            .then(() => {
                // Si el envío es exitoso, se elimina el carrito del localStorage,
                localStorage.removeItem('carritoCheckout');
                // se reinicia el carrito local,
                localStorage.setItem('carrito', JSON.stringify([]));
                // y se muestra una alerta de éxito con SweetAlert.
                Swal.fire({
                    title: '¡Pedido Confirmado!',
                    html: `
                        <p>Tu pedido por ₡${datosCorreo.total} ha sido procesado.</p>
                        <p class="small text-muted">Método de pago: ${datosCorreo.tipo_tarjeta.toUpperCase()} ${datosCorreo.tarjeta}</p>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    // Redirigir a la página de inicio después de cerrar la alerta.
                    willClose: () => {
                        window.location.href = 'home.html';
                    }
                });
            })
            .catch(error => {
                // Si hay un error en el envío, se muestra un mensaje de error en la consola
                console.error('Error:', error);
                // y se muestra una alerta de error al usuario.
                Swal.fire({
                    title: 'Error',
                    text: 'No pudimos procesar tu pedido. Por favor intenta nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
                // Se vuelve a habilitar el botón de envío y se restablece su texto.
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Confirmar Pedido';
            });
    });

    // --- Formatear el número de tarjeta mientras se escribe ---
    // Se agrega un listener al campo de número de tarjeta para formatearlo
    // automáticamente con espacios cada 4 dígitos.
    document.querySelector('input[name="numero_tarjeta"]').addEventListener('input', function(e) {
        let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = '';

        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += value[i];
        }

        this.value = formatted.trim();
    });

    // --- Formatear la fecha de expiración de la tarjeta mientras se escribe ---
    // Se agrega un listener al campo de fecha de expiración para formatearlo
    // automáticamente con un '/' después de los primeros dos dígitos.
    document.querySelector('input[name="expiracion_tarjeta"]').addEventListener('input', function(e) {
        let value = this.value.replace(/[^0-9]/g, '');

        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }

        this.value = value;
    });
});