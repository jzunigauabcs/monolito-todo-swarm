const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Crear un Pool de conexiones (más eficiente para Swarm)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'todo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promesa para verificar la tabla al inicio
const initializeDB = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT false
    )
  `;
  pool.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error al inicializar tabla, reintentando en 5s...', err.message);
      setTimeout(initializeDB, 5000);
    } else {
      console.log('Tabla de base de datos lista');
    }
  });
};

initializeDB();

app.get('/todos', (req, res) => {
  pool.query('SELECT * FROM todos', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post('/todos', (req, res) => {
  const { title } = req.body;
  pool.query('INSERT INTO todos (title) VALUES (?)', [title], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, title, completed: false });
  });
});

app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  pool.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Updated successfully' });
  });
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM todos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
