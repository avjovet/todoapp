const API_URL = 'http://localhost:5000/todos';

// --- CÓDIGO A AGREGAR AQUÍ ---
// Importa los módulos de Firebase necesarios
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged, // Para escuchar el estado de autenticación
  signOut // Para cerrar sesión
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Configuración de Firebase (¡asegúrate de usar tu apiKey real!)
const firebaseConfig = {
  apiKey: "AIzaSyBSiWbt6CF78zzescrQbiGbJzBe6sboL-w", // ¡Tu apiKey real!
  authDomain: "todolist-92e56.firebaseapp.com",
  projectId: "todolist-92e56",
  // Añade otros campos si los tienes en tu config original (storageBucket, messagingSenderId, appId, measurementId)
};

// Inicializa Firebase y obtiene la instancia de Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Referencia al contenedor principal de la app y al botón de logout
const appContent = document.getElementById('app-content'); // Debe coincidir con el ID en index.html
const logoutBtn = document.getElementById('logout-btn'); // Debe coincidir con el ID en index.html

// Listener para cambios en el estado de autenticación (protege la página)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // El usuario está logueado. Mostrar contenido y cargar tareas.
    console.log("Usuario logueado en index.html:", user.uid);
    if (appContent) { // Verifica que el elemento existe antes de intentar mostrarlo
      appContent.style.display = 'block'; // Muestra el contenido principal
    }
    fetchTodos(); // Llama a la función para cargar las tareas

    // Agrega el event listener para el botón de cerrar sesión aquí
    if (logoutBtn) { // Verifica que el botón existe
      logoutBtn.addEventListener('click', async () => {
        try {
          await signOut(auth); // Cierra la sesión de Firebase
          console.log("Sesión cerrada exitosamente.");
          // onAuthStateChanged detectará que el usuario es null y redirigirá
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
          alert("Error al cerrar sesión: " + error.message);
        }
      });
    }

  } else {
    // El usuario NO está logueado. Ocultar contenido y redirigir a login.
    console.log("Usuario no logueado en index.html, redirigiendo a login.html");
     if (appContent) { // Opcional: asegúrate de que el contenido está oculto
       appContent.style.display = 'none';
     }
    // Redirigir a la página de login, solo si no estás ya ahí para evitar loops
    if (window.location.pathname !== '/login.html') { // Evita redireccionar si ya estás en login
       window.location.href = "/login.html";
    }
  }
});

async function getIdToken() {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const select = document.getElementById('importance-select');
const list = document.getElementById('todo-list');




form.addEventListener('submit', async e => {
  e.preventDefault();
  const text = input.value.trim();
  const importance = select.value;
  if (!text) return;

  const token = await getIdToken();

  await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text, importance })
  });

  input.value = '';
  fetchTodos();
});


async function fetchTodos() {
  const token = await getIdToken();
  const res = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const todos = await res.json();
  list.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.dataset.id = todo._id;
    if (todo.completed) li.classList.add('completed');

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleComplete(todo._id, checkbox.checked));

    // Span con texto (sin importancia como texto)
    const span = document.createElement('span');
    span.textContent = todo.text;
    if (todo.completed) span.style.textDecoration = 'line-through';

    // Agregar color de importancia al span (un cuadrito o borde lateral)
    span.style.paddingLeft = '10px';
    span.style.borderLeft = `8px solid ${importanceColor(todo.importance)}`;

    // Agregar doble clic para editar el texto y la importancia
    span.addEventListener('dblclick', async () => {
      const newText = prompt('Editar tarea:', todo.text);
      if (newText === null) return; // cancelar edición
      const newImportance = prompt('Editar importancia (Alta, Media, Baja):', todo.importance);
      if (newImportance === null) return; // cancelar edición

      if (newText.trim() && newImportance.trim()) {
        await editTodo(todo._id, newText.trim(), newImportance.trim());
      }
    });

    // Agregar elementos a li
    const leftContent = document.createElement('div');
    leftContent.classList.add('left-content');
    leftContent.appendChild(checkbox);
    leftContent.appendChild(span);

    li.appendChild(leftContent);

    // Botón eliminar
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.classList.add('delete');
    delBtn.addEventListener('click', () => deleteTodo(todo._id));

    li.appendChild(delBtn);
    list.appendChild(li);
  });

  updateCounters(todos);
}

function importanceColor(level) {
  switch (level.toLowerCase()) {
    case 'alta': return '#ff3b30'; // rojo
    case 'media': return '#ff9500'; // naranja
    case 'baja': return '#34c759'; // verde
    default: return '#d1d1d6'; // gris neutro si no está definido
  }
}

async function toggleComplete(id, completed) {
  const token = await getIdToken();

  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ completed })
  });
  fetchTodos();
}

async function editTodo(id, text, importance) {
  const token = await getIdToken();

  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text, importance })
  });
  fetchTodos();
}


async function deleteTodo(id) {
  const token = await getIdToken();

  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  fetchTodos();
}


function updateCounters(todos) {
  const pendingCount = todos.filter(todo => !todo.completed).length;
  const doneCount = todos.filter(todo => todo.completed).length;

  document.getElementById('pending-count').textContent = pendingCount;
  document.getElementById('done-count').textContent = doneCount;
}

fetchTodos();
