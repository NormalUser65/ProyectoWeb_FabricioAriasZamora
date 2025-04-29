document.addEventListener('DOMContentLoaded', function() {
    // --- Inicialización del Carrito ---
    // Verifica si ya existe un carrito en el almacenamiento local.
    // Si no existe, crea una entrada con un array vacío.
    if (!localStorage.getItem('carrito')) {
        localStorage.setItem('carrito', JSON.stringify([]));
    }

    // --- Creación de la Interfaz de Usuario (UI) del Carrito (Offcanvas) ---
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
    // Añade el contenedor del carrito al final del body del documento.
    document.body.appendChild(carritoContainer);

    // --- Añadir el Botón del Carrito al Navbar ---
    const carritoBtn = document.createElement('button');
    carritoBtn.className = 'btn btn-outline-light ms-2 position-relative';
    carritoBtn.innerHTML = `
        <i class="bi bi-cart-fill"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="contador-carrito">0</span>
    `;
    // Configura los atributos para que el botón controle la visibilidad del offcanvas del carrito.
    carritoBtn.setAttribute('data-bs-toggle', 'offcanvas');
    carritoBtn.setAttribute('data-bs-target', '#carritoOffcanvas');
    // Añade el botón del carrito al elemento de navegación principal.
    document.querySelector('.navbar-nav').appendChild(carritoBtn);

    // --- Manejar el Evento de "Añadir al Carrito" ---
    // Escucha los clicks en el documento para detectar si se hizo clic en un botón de "agregar-carrito".
    document.addEventListener('click', function(e) {
        // Verifica si el elemento clickeado o uno de sus ancestros tiene la clase 'agregar-carrito'.
        if (e.target.classList.contains('agregar-carrito') || e.target.closest('.agregar-carrito')) {
            // Obtiene el ID del producto del atributo 'data-id' del botón clickeado.
            const productId = e.target.closest('.agregar-carrito').dataset.id;
            // Llama a la función para agregar el producto al carrito.
            agregarAlCarrito(productId);
        }
    });

    // --- Funciones de Manipulación del Carrito ---

    // Función para agregar un producto al carrito.
    function agregarAlCarrito(productId) {
        // Obtiene la lista de productos del almacenamiento local.
        const productos = JSON.parse(localStorage.getItem('ultimosProductos')) || [];
        // Busca el producto en la lista por su ID.
        const producto = productos.find(p => p.id == productId);

        if (producto) {
            // Asegura que el precio sea un número. Si es una cadena, intenta parsearlo.
            const precioNumerico = typeof producto.precio === 'string'
                ? parseFloat(producto.precio.replace(/[^0-9.-]+/g,""))
                : producto.precio;

            // Obtiene el carrito actual del almacenamiento local.
            const carrito = JSON.parse(localStorage.getItem('carrito'));
            // Busca si el producto ya existe en el carrito.
            const productoEnCarrito = carrito.find(item => item.id == productId);

            if (productoEnCarrito) {
                // Si el producto ya está en el carrito, incrementa su cantidad.
                productoEnCarrito.cantidad += 1;
            } else {
                // Si el producto no está en el carrito, lo añade con cantidad 1.
                carrito.push({
                    ...producto,
                    precio: precioNumerico,
                    cantidad: 1
                });
            }

            // Guarda el carrito actualizado en el almacenamiento local.
            localStorage.setItem('carrito', JSON.stringify(carrito));
            // Actualiza la visualización del carrito.
            actualizarCarrito();
            // Muestra una notificación al usuario.
            mostrarNotificacion(`${producto.nombre} añadido al carrito`);
        }
    }

    // Función para actualizar la visualización del carrito (lista, total y contador).
    function actualizarCarrito() {
        // Obtiene el carrito del almacenamiento local.
        const carrito = JSON.parse(localStorage.getItem('carrito'));
        // Obtiene referencias a los elementos del DOM donde se mostrará la información del carrito.
        const listaCarrito = document.getElementById('lista-carrito');
        const totalCarrito = document.getElementById('total-carrito');
        const contador = document.getElementById('contador-carrito');

        // Actualiza la lista de productos en el carrito (en el offcanvas).
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

        // Calcula el total del carrito.
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        // Muestra el total formateado.
        totalCarrito.textContent = `₡${total.toLocaleString('es-CR')}`;

        // Actualiza el contador de items en el botón del carrito.
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contador.textContent = totalItems;
        // Muestra u oculta el contador si hay o no items en el carrito.
        contador.style.display = totalItems > 0 ? 'block' : 'none';
    }

    // --- Manejar la Eliminación de Items del Carrito ---
    document.addEventListener('click', function(e) {
        // Verifica si el elemento clickeado o uno de sus ancestros tiene la clase 'eliminar-item'.
        if (e.target.classList.contains('eliminar-item') || e.target.closest('.eliminar-item')) {
            // Obtiene el ID del producto a eliminar.
            const productId = e.target.closest('.eliminar-item').dataset.id;
            // Obtiene el carrito actual.
            const carrito = JSON.parse(localStorage.getItem('carrito'));
            // Encuentra el índice del item a eliminar.
            const itemIndex = carrito.findIndex(item => item.id == productId);

            if (itemIndex !== -1) {
                if (carrito[itemIndex].cantidad > 1) {
                    carrito[itemIndex].cantidad -= 1;
                } else {
                    carrito.splice(itemIndex, 1);
                }

                // Guarda el carrito actualizado.
                localStorage.setItem('carrito', JSON.stringify(carrito));
                // Actualiza la visualización.
                actualizarCarrito();
                mostrarNotificacion('Producto eliminado del carrito');
            }
        }
    });

    // --- Finalizar Compra - Redirección al Formulario de Pedido ---
    document.getElementById('carritoOffcanvas').addEventListener('click', function(e) {
        // Verifica si el click se realizó en el botón "Finalizar Compra".
        if (e.target.id === 'finalizar-compra' || e.target.closest('#finalizar-compra')) {
            // Obtiene el carrito actual.
            const carrito = JSON.parse(localStorage.getItem('carrito'));

            if (carrito.length > 0) {
                // Guarda el carrito en localStorage para usarlo en la página de checkout.
                localStorage.setItem('carritoCheckout', JSON.stringify(carrito));
                // Abre una nueva pestaña o ventana con la página de órdenes/checkout.
                window.open('ordenes.html', '_blank');
            } else {
                alert('Tu carrito está vacío');
            }
        }
    });

    // --- Función para Mostrar Notificaciones (Toast) ---
    function mostrarNotificacion(mensaje) {
        // Crea un nuevo elemento div para la notificación.
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
        // Añade la notificación al body del documento.
        document.body.appendChild(notificacion);
        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    }

    // --- Inicialización al Cargar la Página ---
    // Llama a la función para actualizar la visualización del carrito al cargar la página.
    actualizarCarrito();
});