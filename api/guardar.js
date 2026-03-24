import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const data = req.body;
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const nombreHoja = 'Aportesygastos'; // Asegurate que sea el nombre exacto

    // 1. Buscamos el contenido de la columna A para ver cuál es la última fila real
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${nombreHoja}!A:A`,
    });

    const filasActuales = response.data.values ? response.data.values.length : 0;
    const proximaFila = filasActuales + 1;

    // 2. Preparamos los datos (A a F)
    const tipoFormateado = data.tipo === 'APORTE' ? 'Aporte' : 'Gasto';
    const fila = [
      tipoFormateado,
      data.fecha,
      data.monto,
      data.tc || '1',
      data.tipo === 'APORTE' ? data.persona : '-',
      data.concepto
    ];

    // 3. Escribimos exactamente en la fila siguiente, ignorando las fórmulas de las columnas de al lado
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${nombreHoja}!A${proximaFila}:F${proximaFila}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [fila] },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
