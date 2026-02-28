const express = require('express');

require('dotenv').config();

const { getData } = require('.');
const app = express();
app.use(express.json());


app.post('/code-parce-func-main', async (req, res) => {
  try {
    getData(req, res);
  } catch (error) {
    console.error('Error al obtener datos de Firestore:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
