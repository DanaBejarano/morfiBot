const CLAVE_STORAGE = 'ruleta.items';
const COLORES = ['#f06595', '#fcc2d7', '#e64980', '#ffdeeb', '#f783ac', '#faa2c1'];
const COLOR_TEXTO = ['#ffffff', '#5c1a38', '#ffffff', '#5c1a38', '#ffffff', '#5c1a38'];

const canvas = document.getElementById('ruleta');
const ctx = canvas.getContext('2d');
const lista = document.getElementById('lista');
const form = document.getElementById('form-agregar');
const input = document.getElementById('input-nombre');
const btnGirar = document.getElementById('btn-girar');
const resultado = document.getElementById('resultado');
const chkQuitar = document.getElementById('chk-quitar');
const dlgPegar = document.getElementById('dlg-pegar');
const txtPegar = document.getElementById('txt-pegar');

let items = cargar();
let rotacion = 0;
let girando = false;

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
    if (Array.isArray(guardado)) return guardado;
  } catch {}
  return ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'];
}

function guardar() {
  try { localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items)); } catch {}
}

function colorDe(i) {
  // Evita que el último y el primero tengan el mismo color
  let idx = i % COLORES.length;
  if (i === items.length - 1 && idx === 0 && items.length > 1) idx = 1;
  return idx;
}

function dibujar() {
  const { width: w } = canvas;
  const c = w / 2;
  const r = c - 8;
  ctx.clearRect(0, 0, w, w);

  if (items.length === 0) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffdeeb';
    ctx.fill();
    ctx.fillStyle = '#c2255c';
    ctx.font = '600 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Agregá opciones 💕', c, c + 90);
    return;
  }

  const seg = (Math.PI * 2) / items.length;
  items.forEach((texto, i) => {
    const inicio = rotacion + i * seg;
    const idx = colorDe(i);

    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.arc(c, c, r, inicio, inicio + seg);
    ctx.closePath();
    ctx.fillStyle = COLORES[idx];
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(inicio + seg / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLOR_TEXTO[idx];
    const tam = Math.max(14, Math.min(30, 260 / items.length + 10));
    ctx.font = `700 ${tam}px system-ui, sans-serif`;
    ctx.fillText(recortar(texto, r - 70), r - 18, 0);
    ctx.restore();
  });

  // Borde exterior
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.stroke();
}

function recortar(texto, anchoMax) {
  if (ctx.measureText(texto).width <= anchoMax) return texto;
  let t = texto;
  while (t.length > 1 && ctx.measureText(t + '…').width > anchoMax) t = t.slice(0, -1);
  return t + '…';
}

function renderLista() {
  lista.innerHTML = '';
  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'vacio';
    li.textContent = 'La lista está vacía';
    lista.appendChild(li);
  }
  items.forEach((texto, i) => {
    const li = document.createElement('li');
    li.className = 'item';

    const punto = document.createElement('span');
    punto.className = 'color';
    punto.style.background = COLORES[colorDe(i)];

    const campo = document.createElement('input');
    campo.type = 'text';
    campo.className = 'nombre';
    campo.value = texto;
    campo.addEventListener('input', () => {
      items[i] = campo.value;
      guardar();
      dibujar();
    });
    campo.addEventListener('blur', () => {
      if (!campo.value.trim()) borrar(i);
    });
    campo.addEventListener('keydown', (e) => { if (e.key === 'Enter') campo.blur(); });

    const btnBorrar = document.createElement('button');
    btnBorrar.className = 'borrar';
    btnBorrar.title = 'Borrar';
    btnBorrar.textContent = '×';
    btnBorrar.addEventListener('click', () => borrar(i));

    li.append(punto, campo, btnBorrar);
    lista.appendChild(li);
  });
}

function actualizar() {
  guardar();
  renderLista();
  dibujar();
  btnGirar.disabled = girando || items.length < 2;
}

function agregar(...nuevos) {
  const limpios = nuevos.map((s) => s.trim()).filter(Boolean);
  if (!limpios.length) return;
  items.push(...limpios);
  actualizar();
  lista.scrollTop = lista.scrollHeight;
}

function borrar(i) {
  if (girando) return;
  items.splice(i, 1);
  actualizar();
}

function girar() {
  if (girando || items.length < 2) return;
  girando = true;
  btnGirar.disabled = true;
  resultado.textContent = '';
  resultado.classList.remove('pop');

  const n = items.length;
  const seg = (Math.PI * 2) / n;
  const ganador = Math.floor(Math.random() * n);
  // El puntero está arriba (-90°). Dejamos el centro del ganador ahí, con un poco de azar.
  const jitter = (Math.random() - 0.5) * seg * 0.8;
  const objetivoBase = -Math.PI / 2 - (ganador + 0.5) * seg + jitter;
  const vueltas = 5 + Math.floor(Math.random() * 3);
  let objetivo = objetivoBase;
  while (objetivo < rotacion + vueltas * Math.PI * 2) objetivo += Math.PI * 2;

  const desde = rotacion;
  const duracion = 4500 + Math.random() * 1000;
  const t0 = performance.now();
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);

  function paso(ahora) {
    const t = Math.min(1, (ahora - t0) / duracion);
    rotacion = desde + (objetivo - desde) * easeOut(t);
    dibujar();
    if (t < 1) return requestAnimationFrame(paso);

    rotacion %= Math.PI * 2;
    girando = false;
    const nombre = items[ganador];
    resultado.textContent = `🎉 ${nombre} 🎉`;
    void resultado.offsetWidth;
    resultado.classList.add('pop');

    if (chkQuitar.checked) {
      items.splice(ganador, 1);
    }
    actualizar();
  }
  requestAnimationFrame(paso);
}

// Eventos
form.addEventListener('submit', (e) => {
  e.preventDefault();
  agregar(input.value);
  input.value = '';
  input.focus();
});

btnGirar.addEventListener('click', girar);
canvas.addEventListener('click', girar);

document.getElementById('btn-mezclar').addEventListener('click', () => {
  if (girando) return;
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  actualizar();
});

document.getElementById('btn-vaciar').addEventListener('click', () => {
  if (girando || !items.length) return;
  if (confirm('¿Borrar toda la lista?')) {
    items = [];
    resultado.textContent = '';
    actualizar();
  }
});

document.getElementById('btn-pegar').addEventListener('click', () => {
  txtPegar.value = '';
  dlgPegar.showModal();
});
dlgPegar.addEventListener('close', () => {
  if (dlgPegar.returnValue === 'ok') agregar(...txtPegar.value.split(/[\n,]/));
});

// Controles de ventana (solo existen dentro de Electron)
const controlVentana = window.ventana;
document.getElementById('btn-min').addEventListener('click', () => controlVentana?.minimizar());
document.getElementById('btn-cerrar').addEventListener('click', () => controlVentana?.cerrar());
const btnFijar = document.getElementById('btn-fijar');
btnFijar.addEventListener('click', async () => {
  if (!controlVentana) return;
  const fijado = await controlVentana.alternarFijado();
  btnFijar.classList.toggle('activo', fijado);
});

actualizar();
