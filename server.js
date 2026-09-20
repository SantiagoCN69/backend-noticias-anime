import express from 'express';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const KUDASAI_URL = 'https://somoskudasai.com/noticias/anime/';

app.get('/api/noticias', async (req, res) => {
  try {
    const response = await fetch(KUDASAI_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) throw new Error("No se pudo conectar con la fuente de noticias");

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const arrayArticulos = [];

    // Recolectamos los datos directamente de cada artículo
    $('main article').each((i, el) => {
      const articulo = $(el);
      const titulo = articulo.find('h3 a').text().trim();
      const enlace = articulo.find('h3 a').attr('href') || '';
      const imagenUrl = articulo.find('figure img').attr('src') || '';
      const fechaAutor = articulo.find('footer span.truncate').text().trim();

      if (titulo) {
        arrayArticulos.push({ 
          titulo, 
          enlace, 
          imagenUrl, // <-- URL directa de la imagen
          fechaAutor 
        });
      }
    });

    res.json({
      total: arrayArticulos.length,
      noticias: arrayArticulos
    });

  } catch (error) {
    console.error("Error al procesar las noticias:", error.message);
    res.status(500).json({ error: 'Error al procesar las noticias' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});