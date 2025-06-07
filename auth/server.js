// auth/server.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');
// Cargar las credenciales Firebase

const serviceAccount = require(path.resolve(__dirname, 'todolist-92e56-firebase-adminsdk-fbsvc-e851359006.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para validar token ID de Firebase
app.post('/validateToken', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token no enviado' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // decodedToken contiene info como uid, email, etc.
    res.json({ valid: true, uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    res.status(401).json({ valid: false, error: error.message });
  }
});

const PORT = 6000;
app.listen(PORT, () => console.log(`Auth service listening on port ${PORT}`));
