document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'https://raw.githubusercontent.com/NormalUser65/ProyectoWeb_FabricioAriasZamora/main/Json/productos.json';
    const productosContainer = document.getElementById('productos-container');
    
    // Mostrar spinner de carga
    productosContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando productos...</p>
        </div>
    `;

    async function cargarProductos() {
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const data = await response.json();
            
            if (!data.productos || !Array.isArray(data.productos)) {
                throw new Error('Formato de datos inválido');
            }
            
            return data.productos;
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            throw error;
        }
    }

    function mostrarProductos(productos) {
        if (!productos || productos.length === 0) {
            productosContainer.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="bi bi-exclamation-circle fs-1"></i>
                    <h3>No hay productos disponibles</h3>
                    <p>Actualmente no tenemos productos en exhibición</p>
                </div>
            `;
            return;
        }

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

    function manejarError() {
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

    cargarProductos()
        .then(productos => {
            mostrarProductos(productos);
            localStorage.setItem('ultimosProductos', JSON.stringify(productos));
            localStorage.setItem('ultimaActualizacion', Date.now());
        })
        .catch(() => manejarError());
});