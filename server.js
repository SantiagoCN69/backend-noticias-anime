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


app.get('/api/imagen-base64', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).json({ error: 'Falta la URL de la imagen' });

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'];
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    res.json({ base64: dataUri });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener o convertir la imagen' });
  }
});


  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });