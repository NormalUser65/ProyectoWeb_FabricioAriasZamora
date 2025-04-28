document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrito si no existe
    if (!localStorage.getItem('carrito')) {
        localStorage.setItem('carrito', JSON.stringify([]));
    }

    // Crear elementos del carrito UI
    const carritoContainer = document.createElement('div');
    carritoContainer.className = 'offcanvas offcanvas-end';
    carritoContainer.id = 'carritoOffcanvas';
    carritoContainer.innerHTML = `
        <div class="offcanvas-header bg-success text-white">
            <h5 class="offcanvas-title">Tu Carrito</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div id="lista-carrito" class="mb-3"></div>
            <div class="border-top pt-3">
                <h5>Total: <span id="total-carrito">₡0</span></h5>
                <button class="btn btn-success w-100 mt-2" id="finalizar-compra">Finalizar Compra</button>
            </div>
        </div>
    `;
    document.body.appendChild(carritoContainer);

    // Añadir botón del carrito al navbar
    const carritoBtn = document.createElement('button');
    carritoBtn.className = 'btn btn-outline-light ms-2 position-relative';
    carritoBtn.innerHTML = `
        <i class="bi bi-cart-fill"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="contador-carrito">0</span>
    `;
    carritoBtn.setAttribute('data-bs-toggle', 'offcanvas');
    carritoBtn.setAttribute('data-bs-target', '#carritoOffcanvas');
    document.querySelector('.navbar-nav').appendChild(carritoBtn);

    // Manejar eventos de añadir al carrito
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('agregar-carrito') || e.target.closest('.agregar-carrito')) {
            const productId = e.target.closest('.agregar-carrito').dataset.id;
            agregarAlCarrito(productId);
        }
    });

    // Funciones del carrito
    function agregarAlCarrito(productId) {
        const productos = JSON.parse(localStorage.getItem('ultimosProductos')) || [];
        const producto = productos.find(p => p.id == productId);
        
        if (producto) {
            const precioNumerico = typeof producto.precio === 'string' 
                ? parseFloat(producto.precio.replace(/[^0-9.-]+/g,""))
                : producto.precio;
            
            const carrito = JSON.parse(localStorage.getItem('carrito'));
            const productoEnCarrito = carrito.find(item => item.id == productId);
            
            if (productoEnCarrito) {
                productoEnCarrito.cantidad += 1;
            } else {
                carrito.push({
                    ...producto,
                    precio: precioNumerico,
                    cantidad: 1
                });
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarCarrito();
            mostrarNotificacion(`${producto.nombre} añadido al carrito`);
        }
    }

    function actualizarCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito'));
        const listaCarrito = document.getElementById('lista-carrito');
        const totalCarrito = document.getElementById('total-carrito');
        const contador = document.getElementById('contador-carrito');
        
        // Actualizar lista de productos
        listaCarrito.innerHTML = carrito.length > 0 ? 
            carrito.map(item => `
                <div class="card mb-2">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-title">${item.nombre}</h6>
                            <div class="d-flex align-items-center">
                                <span class="text-muted me-2">${item.cantidad} x ₡${item.precio.toLocaleString('es-CR')}</span>
                                <span class="fw-bold">₡${(item.precio * item.cantidad).toLocaleString('es-CR')}</span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger eliminar-item" data-id="${item.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('') : 
            '<p class="text-muted text-center">Tu carrito está vacío</p>';
        
        // Calcular y mostrar total
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        totalCarrito.textContent = `₡${total.toLocaleString('es-CR')}`;
        
        // Actualizar contador
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'block' : 'none';
    }

    // Manejar eliminación de items
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('eliminar-item') || e.target.closest('.eliminar-item')) {
            const productId = e.target.closest('.eliminar-item').dataset.id;
            const carrito = JSON.parse(localStorage.getItem('carrito'));
            const itemIndex = carrito.findIndex(item => item.id == productId);
            
            if (itemIndex !== -1) {
                if (carrito[itemIndex].cantidad > 1) {
                    carrito[itemIndex].cantidad -= 1;
                } else {
                    carrito.splice(itemIndex, 1);
                }
                
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarCarrito();
                mostrarNotificacion('Producto eliminado del carrito');
            }
        }
    });

    // Finalizar compra - Redirigir a nueva pestaña con formulario
document.getElementById('carritoOffcanvas').addEventListener('click', function(e) {
    if (e.target.id === 'finalizar-compra' || e.target.closest('#finalizar-compra')) {
        const carrito = JSON.parse(localStorage.getItem('carrito'));
        
        if (carrito.length > 0) {
            // Guardar carrito temporalmente para la próxima página
            localStorage.setItem('carritoCheckout', JSON.stringify(carrito));
            
            // Abrir nueva pestaña con el formulario de compra
            window.open('ordenes.html', '_blank'); // Cambia "checkout.html" por tu ruta
        } else {
            alert('Tu carrito está vacío');
        }
    }
});

    // Mostrar notificación
    function mostrarNotificacion(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'position-fixed bottom-0 end-0 p-3';
        notificacion.style.zIndex = '11';
        notificacion.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-success text-white">
                    <strong class="me-auto">Mangosas</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${mensaje}
                </div>
            </div>
        `;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    }

    // Inicializar carrito
    actualizarCarrito();
});