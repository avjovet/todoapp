import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// login.js
const firebaseConfig = {
  apiKey: "AIzaSyBSiWbt6CF78zzescrQbiGbJzBe6sboL-w",
  authDomain: "todolist-92e56.firebaseapp.com",
  projectId: "todolist-92e56",
};

// ... tus imports existentes de firebase-app y firebase-auth
// ... tu configuración de firebaseConfig
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- CÓDIGO A AGREGAR AQUÍ ---
// Verifica si el usuario ya está logueado al cargar la página de login
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si hay un usuario autenticado, redirige a la página principal (index.html)
    console.log("Usuario ya logueado en login.html, redirigiendo a index.html");
    window.location.href = "/index.html";
  }
  // Si no hay usuario, no haces nada y el usuario se queda en login.html
});
// --- FIN CÓDIGO A AGREGAR ---



// Tabs y secciones
const btnLoginTab = document.getElementById("btn-login");
const btnRegisterTab = document.getElementById("btn-register");
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");

// Inputs y botones login
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");

// Inputs y botones registro
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerBtn = document.getElementById("register-btn");

// Funciones para mostrar sección
btnLoginTab.onclick = () => {
  loginSection.classList.remove("hidden");
  registerSection.classList.add("hidden");
};

btnRegisterTab.onclick = () => {
  registerSection.classList.remove("hidden");
  loginSection.classList.add("hidden");
};

// Login
loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value;
  const password = loginPassword.value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    const res = await fetch("http://localhost:6000/validateToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (data.valid) {
      localStorage.setItem("token", token);
    window.location.href = "/index.html"; // Ajusta según tu app
    } else {
      alert("Token inválido");
    }
  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
  }
});

// Registro
registerBtn.addEventListener("click", async () => {
  const email = registerEmail.value;
  const password = registerPassword.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Registro exitoso, ahora puedes iniciar sesión.");
    btnLoginTab.click(); // Cambiar a pestaña login
  } catch (error) {
    alert("Error al registrar: " + error.message);
  }
});
