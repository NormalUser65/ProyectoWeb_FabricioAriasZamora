emailjs.init('x9v1X4yhNQnAg4_uv');

document.addEventListener('DOMContentLoaded', function() {
    const carrito = JSON.parse(localStorage.getItem('carritoCheckout')) || [];
    const resumenCarrito = document.getElementById('resumen-carrito');
    const formulario = document.getElementById('formulario-pedido');
    const fechaNacimientoInput = document.querySelector('input[name="fecha_nacimiento"]');

    // Validar edad (mínimo 18 años)
    fechaNacimientoInput.addEventListener('change', function() {
        const fechaNacimiento = new Date(this.value);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }
        
        if (edad < 18) {
            this.classList.add('is-invalid');
            Swal.fire({
                title: 'Edad no válida',
                text: 'Debes ser mayor de 18 años para realizar compras.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        } else {
            this.classList.remove('is-invalid');
        }
    });

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
        
        // Validar edad nuevamente
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
            return;
        }

        // Mostrar loader
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';

        // Formatear número de tarjeta para mostrar solo los últimos 4 dígitos
        const numeroTarjeta = this.numero_tarjeta.value;
        const tarjetaOculta = '**** **** **** ' + numeroTarjeta.slice(-4);

        const datosCorreo = {
            nombre: this.nombre.value,
            telefono: this.telefono.value,
            direccion: this.direccion.value,
            notas: this.notas.value,
            tipo_tarjeta: this.tipo_tarjeta.value,
            tarjeta: tarjetaOculta,
            expiracion: this.expiracion_tarjeta.value,
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
                localStorage.removeItem('carritoCheckout');
                localStorage.setItem('carrito', JSON.stringify([]));
                
                Swal.fire({
                    title: '¡Pedido Confirmado!',
                    html: `
                        <p>Tu pedido por ₡${datosCorreo.total} ha sido procesado.</p>
                        <p class="small text-muted">Método de pago: ${datosCorreo.tipo_tarjeta.toUpperCase()} ${datosCorreo.tarjeta}</p>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
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

    // Formatear número de tarjeta
    document.querySelector('input[name="numero_tarjeta"]').addEventListener('input', function(e) {
        let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += value[i];
        }
        
        this.value = formatted.trim();
    });

    // Formatear fecha de expiración
    document.querySelector('input[name="expiracion_tarjeta"]').addEventListener('input', function(e) {
        let value = this.value.replace(/[^0-9]/g, '');
        
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        this.value = value;
    });
});