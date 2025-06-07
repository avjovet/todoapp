const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();
app.use(cors());
app.use(express.json());               // 1️⃣  sin body-parser

mongoose.connect('mongodb://mongo:27017/todos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error(err));

const todoSchema = new mongoose.Schema({
  text:       { type: String, required: true },
  completed:  { type: Boolean, default: false },
  importance: { type: String, enum: ['Alta', 'Media', 'Baja'], default: 'Media' }
});
const Todo = mongoose.model('Todo', todoSchema);

/* ---------- Rutas ---------- */

// GET todas
app.get('/todos', async (_, res) => {
  const todos = await Todo.find().sort({ _id: -1 });
  res.json(todos);
});

// POST nueva
app.post('/todos', async (req, res) => {
  try {
    const { text, importance = 'Media' } = req.body;
    const todo = await Todo.create({ text, importance });
    res.status(201).json(todo);        // 2️⃣  201 Created
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT actualizar
app.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }   // 3️⃣  valida enum
    );
    if (!todo) return res.status(404).json({ error: 'No existe' });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE borrar
app.delete('/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ error: 'No existe' });
  res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend escuchando en puerto ${PORT}`));

