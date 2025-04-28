// Configuración EmailJS
emailjs.init('x9v1X4yhNQnAg4_uv');

document.addEventListener('DOMContentLoaded', function() {
    // Obtener carrito de localStorage
    const carrito = JSON.parse(localStorage.getItem('carritoCheckout')) || [];
    const resumenCarrito = document.getElementById('resumen-carrito');
    const formulario = document.getElementById('formulario-pedido');

    // Mostrar resumen del carrito
    if (carrito.length === 0) {
        resumenCarrito.innerHTML = '<div class="alert alert-warning">No hay productos en el carrito. <a href="index.html">Volver a la tienda</a></div>';
        formulario.style.display = 'none';
        return;
    }

    // Generar tabla de productos
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

    // Enviar correo al confirmar
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Mostrar loader
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';

        const datosCorreo = {
            nombre: this.nombre.value,
            telefono: this.telefono.value,
            direccion: this.direccion.value,
            notas: this.notas.value,
            productos: carrito.map(item => 
                `<div style="margin-bottom: 15px;">
                   <strong>${item.nombre}</strong><br>
                   • Cantidad: ${item.cantidad}<br>
                   • Precio unitario: ₡${item.precio.toLocaleString('es-CR')}<br>
                   • Subtotal: ₡${(item.precio * item.cantidad).toLocaleString('es-CR')}
                 </div>`
            ).join(''),
            total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toLocaleString('es-CR'),
            fecha_hora: new Date().toLocaleString('es-CR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Enviar correo
emailjs.send("service_9rbrn2c", "template_la5dfju", datosCorreo)
    .then(() => {
        // Éxito: Limpiar carrito y redirigir
        localStorage.removeItem('carritoCheckout');
        localStorage.setItem('carrito', JSON.stringify([]));
        
        // Redirigir a home.html después de 2 segundos (opcional)
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
        
        // Mostrar mensaje de confirmación antes de redirigir
        Swal.fire({
            title: '¡Pedido Confirmado!',
            text: `Tu pedido por ₡${datosCorreo.total} ha sido procesado.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#28a745',
            timer: 2000,  // Cierra automáticamente después de 2 segundos
            timerProgressBar: true,
            willClose: () => {
                window.location.href = 'home.html';
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No pudimos procesar tu pedido. Por favor intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirmar Pedido';
    });
    });
});