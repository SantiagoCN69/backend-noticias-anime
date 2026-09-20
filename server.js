import express from 'express';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const KUDASAI_URL = 'https://somoskudasai.com/noticias/anime/';

// Función auxiliar robusta para convertir cualquier URL de imagen a Base64
async function convertirUrlABase64(urlImagen) {
  if (!urlImagen) return null;
  try {
    const response = await fetch(urlImagen, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error(`Fallo al convertir imagen (${urlImagen}):`, error.message);
    return null;
  }
}

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

    // 1. Recolectamos los datos básicos de cada artículo primero
    $('main article').each((i, el) => {
      const articulo = $(el);
      const titulo = articulo.find('h3 a').text().trim();
      const enlace = articulo.find('h3 a').attr('href') || '';
      const imagenUrl = articulo.find('figure img').attr('src') || '';
      const fechaAutor = articulo.find('footer span.truncate').text().trim();

      if (titulo) {
        arrayArticulos.push({ titulo, enlace, imagenUrl, fechaAutor });
      }
    });

    // 2. Convertimos todas las imágenes a Base64 EN PARALELO usando Promise.all
    // Esto es mucho más rápido que hacer un bucle `for...of` secuencial.
    const noticiasConBase64 = await Promise.all(
      arrayArticulos.map(async (item) => {
        const imagenBase64 = await convertirUrlABase64(item.imagenUrl);
        return {
          titulo: item.titulo,
          enlace: item.enlace,
          fechaAutor: item.fechaAutor,
          imagenBase64: imagenBase64 // Aquí va el Base64 listo para usar en tu <img src="...">
        };
      })
    );

    res.json({
      total: noticiasConBase64.length,
      noticias: noticiasConBase64
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar las noticias y las imágenes' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});