const container = document.querySelector('.container');
const main = document.querySelector('#main');

const sidebar = document.querySelector('.modal-body');
const sidebarHeader = document.querySelector('#modalTitle')
const sidebarFooter = document.querySelector('.modal-footer')
const btnCarrito = document.querySelector('.btn-carrito');
const cantidadCarrito = document.querySelector('.cant-carrito')
const btnCarritoLogo = document.querySelector('.myButton')

const bannerTit = document.querySelector('.banner-tit')
const btnPizzas = document.querySelector('.btn-dstc')
const btnHamburger = document.querySelector('.btn-combos')
const btnAll = document.querySelector('.btn-all')

let map;
let marker;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: -36.89590946357272,
      lng: -60.316581144315016
    },
    zoom: 18,
  });

  marker = new google.maps.Marker({
    map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: {
      lat: -36.8959974022693,
      lng: -60.31657202571023
    },
    title: 'Pizzeria',
    icon: {
      url: 'https://img.icons8.com/pastel-glyph/452/pizza--v3.png',
      scaledSize: new google.maps.Size(38, 42)
    },
  });
  marker.setAnimation(google.maps.Animation.BOUNCE);
}

var myModal = new bootstrap.Modal(document.getElementById('miModal'), {
  keyboard: true
})

let carrito = JSON.parse(localStorage.getItem('carrito')) || []



async function obtenerPizzas() {
  const response = await fetch("pizzas.json")
  return await response.json()
}

async function obtenerHmbrg() {
  const response = await fetch('hamburguesas.json')
  return await response.json()
}

function cargarFuncion(intento) {
  return intento().then(comida => {
    comida.forEach((element) => {
      main.innerHTML += `
      <div class="caja col">
            <div class="card">
            <img class="caja-img card-img-top img-fluid" src = "${element.imagen}">
              <div class="caja-datos card-body">
                <h5 class="nombre card-title"> ${element.nombre}</h5>
                <h4 class="star card-text">${element.star}</h4>
                <h4 class="precio card-subtitle">$<span>${element.precio}</span></h4>
                <button class="btn-agregar btn btn-danger" data-id="${element.id}">COMPRAR</br>
                </div>
                </div>
                </div>
                `
    })
    const btnAgregar = document.querySelectorAll('.btn-agregar');
    btnAgregar.forEach((e) =>
      e.addEventListener('click', (e) => {
        let cardPadre = e.target.parentElement;
        agregarAlCarrito(cardPadre);
        const Toast = Swal.mixin({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: false,
          width: "58%",
          background: '#EEFFE5',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })

        Toast.fire({
          icon: 'success',
          title: 'Agregado correctamente a tu carrito'
        })
      }))
  });
}
cargarFuncion(obtenerPizzas);

btnPizzas.addEventListener('click', () => {
  main.innerHTML = '';
  cargarFuncion(obtenerPizzas);
})
btnHamburger.addEventListener('click', () => {
  main.innerHTML = '';
  cargarFuncion(obtenerHmbrg);
})
btnAll.addEventListener('click', () => {
  main.innerHTML = '';
  cargarFuncion(obtenerPizzas);
  cargarFuncion(obtenerHmbrg);
})

btnCarrito.addEventListener('click', () => {
  sidebar.classList.toggle('active')
});

const agregarAlCarrito = (cardPadre) => {
  let producto = {
    nombre: cardPadre.querySelector('.nombre').textContent,
    precio: Number(cardPadre.querySelector('.precio span').textContent),
    cantidad: 1,
    star: cardPadre.querySelector('.star').textContent,
    imagen: cardPadre.parentElement.querySelector('img').src,
    id: Number(cardPadre.querySelector('button').getAttribute('data-id')),
  }

  let productoEncontrado = carrito.find(e => e.id === producto.id)
  if (productoEncontrado) {
    productoEncontrado.cantidad++;
  } else {
    carrito.push(producto);
  }
  mostrarCarrito();
}

const mostrarCarrito = () => {
  sidebar.innerHTML = "";
  carrito.forEach((element) => {
    let {
      imagen,
      nombre,
      star,
      precio,
      cantidad,
      id
    } = element;
    sidebar.innerHTML += `
    <div class="caja-carrito card mb-1">
  <div class="row no-gutters">
    <div class="col-4 col-lg-6">
      <img src="${imagen}" class="caja-carrito-img card-img" alt="...">
    </div>
    <div class="col-8 col-lg-6">
      <div class="caja-carrito-datos card-body">
        <h5 class="nombre card-title">${nombre}</h5>
        <h6 class="star card-text">${star}</h6>
        <h6 class="precio card-text">Unidad: $${precio}</h6>
        <h6 class="cantidad card-text">Cantidad: ${cantidad}</h6>
        <h6 class="subtotal card-text">Sub-Total: $${precio*cantidad}</h6>
        <button class="btn-restar btn btn-outline-danger" data-id="${id}">-</br>
        <button class='btn-sumar btn btn-outline-danger' data-id='${id}'>+</button>
        <button class="btn-borrar btn btn-outline-danger" data-id="${id}">borrar</br>
      </div>
    </div>
  </div>
</div>
        
    `
  })

  localStorage.setItem('carrito', JSON.stringify(carrito));
  aumentarNumCarrito();
}

const restarProducto = (productoRestar) => {
  let productoEncontrado = carrito.find((element) => element.id === Number(productoRestar))
  if (productoEncontrado) {
    productoEncontrado.cantidad--;
    if (productoEncontrado.cantidad === 0) {
      productoEncontrado.cantidad = 1;
    }
  }
  mostrarCarrito();
}
const agregarProducto = (productoAgregar) => {
  let productoEncontrado = carrito.find((element) => element.id === Number(productoAgregar))
  if (productoEncontrado) {
    productoEncontrado.cantidad++;
  }
  mostrarCarrito();
}

const borrarProducto = (productoBorrar) => {
  carrito = carrito.filter((element) => element.id !== Number(productoBorrar));
  mostrarCarrito();
}

const escucharBtnsSidebar = () => {
  sidebar.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-restar')) {
      restarProducto(e.target.getAttribute('data-id'))
    }
    if (e.target.classList.contains('btn-sumar')) {
      agregarProducto(e.target.getAttribute('data-id'))
    }
    if (e.target.classList.contains('btn-borrar')) {
      borrarProducto(e.target.getAttribute('data-id'))
    }
    if (e.target.classList.contains('btn-pagar')) {
      cantidadCarrito.classList.remove('active')
      sidebar.innerHTML = `
      <div>Gracias por su compra</div>
      <button class='btn-regresar'>Realizar otra compra</button>
      `
      Swal.fire({
        position: 'top',
        icon: 'success',
        title: 'Compra realizada',
        showConfirmButton: false,
        timer: 1500
      })
    }
    if (e.target.classList.contains('btn-cancelar')) {
      mostrarCarrito()
    }
    if (e.target.classList.contains('btn-regresar')) {
      carrito = [];
      mostrarCarrito()
    }
  })
  sidebarFooter.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-comprar')) {
      sumarTodo()
    }
    if (e.target.classList.contains('btn-confirmar')) {
      carrito = []
      mostrarCarrito();
      myModal.toggle()
      Swal.fire({
          title: 'Compra realizada',
          text: "Tu camino va en camino, esperamos que lo disfrutes!!",
          icon: 'success',
          showCancelButton: false,
          confirmButtonColor: '#d33'
        },
      )
    } else if (e.target.classList.contains('btn-cancelar')) {
      mostrarCarrito();
    }
    if (e.target.classList.contains('btn-cancelAll')) {
      carrito = [];
      mostrarCarrito();
    }
  })
};

const sumarTodo = () => {
  let sumaTotal = carrito.reduce((acc, ite) => acc + (ite.precio) * (ite.cantidad), 0)
  let total = carrito.reduce((acc, ite) => acc + ite.cantidad, 0)
  sidebarHeader.innerText = `Orden de Compra`
  sidebar.innerHTML = `
  <p>Por tus ${total} pizzas:</p> 
  <b>Tu total es: $${sumaTotal}</b>
  `
  sidebarFooter.innerHTML = `
  <button class='btn-cancelar btn btn-danger'>Cancelar</button>
  <button class='btn-confirmar btn btn-danger'>Confirmar</button>
  `
}

const aumentarNumCarrito = () => {
  let total = carrito.reduce((acc, ite) => acc + ite.cantidad, 0)
  document.querySelector('.cant-carrito').textContent = total;
  if (total === 0) {
    sidebar.innerHTML = `Tu carrito esta vacio, prueba a seleccionar algo de la carta uwu`
    sidebarHeader.innerText = `Mi carrito`
    sidebarFooter.innerHTML = ``
    cantidadCarrito.classList.remove('active')
  } else if (total > 0) {
    cantidadCarrito.classList.add('active')
    sidebarFooter.innerHTML = `
    <button class='btn-cancelAll btn btn-danger'>Borrar Todo</button>
    <button class='btn-comprar btn btn-danger'>Comprar</button>
    `
  }
}
mostrarCarrito();
escucharBtnsSidebar();