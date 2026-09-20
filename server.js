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
      // Supongamos que aquí obtienes los datos de la fuente externa o base de datos
      const articulos = [
          {
              titulo: "Ejemplo de noticia",
              descripcion: "Descripción de la noticia...",
              urlOriginal: "https://ejemplo.com/imagen.jpg" // Campo con la URL directa
          }
      ];

      // Mapeamos los datos para asegurar que el frontend reciba el campo limpio
      const noticiasFormateadas = articulos.map(item => ({
          titulo: item.titulo,
          descripcion: item.descripcion,
          imagenUrl: item.urlOriginal // <-- Campo añadido para pruebas
      }));

      res.json(noticiasFormateadas);
  } catch (error) {
      console.error("Error en /api/noticias:", error);
      res.status(500).json({ error: "Error interno al procesar las noticias" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});