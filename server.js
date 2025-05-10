const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const KUDASAI_URL = 'https://www3.animeflv.net/kudasai.php';

app.get('/api/noticias', async (req, res) => {
  try {
    const response = await axios.get(KUDASAI_URL);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las noticias' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
