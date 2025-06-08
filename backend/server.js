const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const admin = require('firebase-admin');

const path = require('path');
const serviceAccount = require(path.resolve(__dirname, 'todolist-92e56-firebase-adminsdk-fbsvc-e851359006.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());
              
async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token faltante o inválido' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
}


mongoose.connect('mongodb://mongo:27017/todos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error(err));

const todoSchema = new mongoose.Schema({
  userId:     { type: String, required: true }, // Firebase UID
  text:       { type: String, required: true },
  completed:  { type: Boolean, default: false },
  importance: { type: String, enum: ['Alta', 'Media', 'Baja'], default: 'Media' }
});

const Todo = mongoose.model('Todo', todoSchema);

/* ---------- Rutas ---------- */

// GET todas
app.get('/todos', verificarToken, async (req, res) => {
  const userId = req.user.uid;
  const todos = await Todo.find({ userId }).sort({ _id: -1 });
  res.json(todos);
});


// POST nueva
app.post('/todos', verificarToken, async (req, res) => {
  try {
    const { text, importance = 'Media' } = req.body;
    const userId = req.user.uid;

    const todo = await Todo.create({ text, importance, userId });
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.put('/todos/:id', verificarToken, async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.uid },
    req.body,
    { new: true, runValidators: true }
  );
  if (!todo) return res.status(404).json({ error: 'No existe o no autorizado' });
  res.json(todo);
});

app.delete('/todos/:id', verificarToken, async (req, res) => {
  const todo = await Todo.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.uid
  });
  if (!todo) return res.status(404).json({ error: 'No existe o no autorizado' });
  res.json({ success: true });
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Backend escuchando en puerto ${PORT}`));

