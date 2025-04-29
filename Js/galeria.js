document.addEventListener('DOMContentLoaded', function() {
    // --- Constantes y Elementos del DOM ---
    // Define la URL de la API que proporciona los datos de los productos.
    const API_URL = 'https://normaluser65.github.io/ProyectoWeb_FabricioAriasZamora/Json/productos.json';
    // Obtiene la referencia al contenedor donde se mostrarán los productos.
    const productosContainer = document.getElementById('productos-container');

    // --- Mostrar indicador de carga (Spinner) ---
    // Inserta un elemento HTML dentro del contenedor para mostrar un spinner de carga
    // mientras se obtienen los datos de los productos.
    productosContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando productos...</p>
        </div>
    `;

    // --- Función asíncrona para cargar los productos desde la API ---
    async function cargarProductos() {
        try {
            // Realiza una petición (request) a la URL de la API utilizando la función fetch.
            const response = await fetch(API_URL);

            // Verifica si la respuesta de la API fue exitosa (código de estado HTTP en el rango 200-299).
            if (!response.ok) {
                // Si la respuesta no es exitosa, lanza un error con el código de estado HTTP.
                throw new Error(`Error HTTP: ${response.status}`);
            }

            // Convierte el cuerpo de la respuesta (que está en formato JSON) a un objeto JavaScript.
            const data = await response.json();

            // --- Validación de la estructura de los datos recibidos ---
            // Verifica si la propiedad 'productos' existe en el objeto 'data'
            // y si su valor es un array. Esto asegura que los datos tengan el formato esperado.
            if (!data.productos || !Array.isArray(data.productos)) {
                throw new Error('Formato de datos inválido');
            }
            // Retorna el array de productos obtenido de la API.
            return data.productos;

        } catch (error) {
            // Captura cualquier error que ocurra durante la petición o el procesamiento de la respuesta.
            console.error('Error al cargar productos:', error);
            // Relanza el error para que el código que llama a esta función pueda manejarlo.
            throw error;
        }
    }

    // --- Función para mostrar los productos en el contenedor HTML ---
    function mostrarProductos(productos) {
        // Verifica si el array de productos es nulo, indefinido o está vacío.
        if (!productos || productos.length === 0) {
            // Si no hay productos, muestra un mensaje indicando que no hay productos disponibles.
            productosContainer.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="bi bi-exclamation-circle fs-1"></i>
                    <h3>No hay productos disponibles</h3>
                    <p>Actualmente no tenemos productos en exhibición</p>
                </div>
            `;
            return;
        }

        // Utiliza la función 'map' para iterar sobre cada producto en el array 'productos'
        // y generar una estructura HTML (template literal) para cada uno.
        productosContainer.innerHTML = productos.map(producto => `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-img-container" style="height: 200px; overflow: hidden;">
                        <img src="${producto.imagen}" alt="${producto.nombre}"
                             class="card-img-top img-fluid h-100 object-fit-cover"
                             loading="lazy"
                             onerror="this.src='../Images/placeholder-producto.png'">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-success">${producto.nombre}</h5>
                        <p class="card-text text-muted">${producto.descripcion}</p>
                        <div class="mt-auto">
                            <p class="card-text fw-bold fs-5 mb-3">₡${producto.precio.toLocaleString('es-CR')}</p>
                            <button class="btn btn-success w-100 agregar-carrito" data-id="${producto.id}">
                                <i class="bi bi-cart-plus"></i> Añadir al carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // --- Función para manejar errores en la carga de productos ---
    function manejarError() {
        // Si ocurre un error durante la carga de productos, se muestra un mensaje de error
        // con opciones para recargar la página o volver al inicio.
        productosContainer.innerHTML = `
            <div class="col-12 text-center text-danger py-5">
                <i class="bi bi-exclamation-triangle-fill fs-1"></i>
                <h3>Error al cargar el menú</h3>
                <p class="text-muted">Estamos teniendo problemas para cargar nuestros productos</p>
                <div class="mt-3">
                    <button class="btn btn-primary me-2" onclick="window.location.reload()">
                        <i class="bi bi-arrow-clockwise"></i> Recargar
                    </button>
                    <a href="../index.html" class="btn btn-outline-secondary">
                        <i class="bi bi-house"></i> Volver al inicio
                    </a>
                </div>
            </div>
        `;
    }

    // --- Llamada a la función para cargar y mostrar los productos ---
    cargarProductos()
        .then(productos => {
            // Si la carga de productos es exitosa, se llama a la función para mostrar los productos.
            mostrarProductos(productos);
            // Adicionalmente, se guardan los productos en el localStorage y se registra la hora de actualización.
            localStorage.setItem('ultimosProductos', JSON.stringify(productos));
            localStorage.setItem('ultimaActualizacion', Date.now());
        })
        .catch(() => manejarError());
});