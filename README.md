# MST — Mister Technology Society

Tienda estática en español hecha con HTML, CSS y JavaScript. Incluye una portada, catálogo en página separada, fichas por producto, búsqueda con sugerencias, precios en pesos chilenos (CLP), carrito persistente y formulario de pedido de demostración.

## Abrir el sitio

Abre `index.html` en un navegador. Es la portada para los clientes; el botón «Explorar productos» lleva al catálogo `productos.html`. Cada producto abre su propia ficha en `producto.html`; los datos de entrega y resumen están en `pago.html`. No requiere instalación, compilación ni servidor.

El buscador está disponible en todas las páginas. Mientras se escribe muestra nombres completos de productos; selecciona una sugerencia para abrir su ficha. Al enviar la búsqueda se abre el catálogo filtrado.

El botón «Oscuro/Claro» está en el encabezado de todas las páginas y guarda la preferencia en este navegador. En el checkout, la casilla de aceptación de términos es obligatoria para continuar; el texto se consulta en un desplegable, sin ventanas emergentes.

## Personalizar

- Edita el arreglo `products` al comienzo de `app.js` para cambiar nombres, categorías, descripciones y precios netos. Los precios se ingresan como números enteros en CLP; el IVA del 19% se calcula sobre el subtotal del carrito.
- El mínimo de envío gratis se configura con `freeShippingThreshold` en `app.js` y por defecto es $60.000 del total con IVA.
- La lista del catálogo usa tarjetas en fila y se adapta a pantallas móviles desde `listing.css`.
- `regions.js` contiene las 16 regiones y 346 comunas para que el checkout funcione sin conexión; la comuna se habilita después de elegir una región.
- Los bloques `IMAGEN POR AGREGAR` en las tarjetas y `IMAGEN PRINCIPAL POR AGREGAR` en la portada están reservados para las imágenes que se incorporarán después.
- El recuadro `TU LOGO` en el encabezado es el espacio reservado para el logo de MST. Cuando esté disponible, reemplaza ese bloque por el archivo de imagen del logo.
- Modifica los colores y estilos en `styles.css`.

## Carrito y pagos

El carrito y los datos de contacto/dirección que el usuario decida guardar se almacenan localmente en el navegador. El formulario valida la entrega y muestra una confirmación de demostración; no procesa pagos ni solicita datos de tarjeta. Para aceptar pagos reales se debe integrar una pasarela de pago y un backend seguro.

La cuenta bancaria de MST no se configura desde el checkout público: la sección de referencia está deshabilitada hasta integrar un proveedor de pagos y un backend seguro. Esta página no recibe ni confirma transferencias.
