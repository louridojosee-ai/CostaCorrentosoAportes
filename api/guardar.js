import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const data = req.body;
    
    // IMPORTANTE: Este es el orden en que aparecerán en tu Excel (Columnas A a G)
    // Podés mover estos elementos para que coincidan con tus columnas reales
    let fila = [];
    if (data.tipo === 'APORTE') {
      fila = ['APORTE', data.fecha, data.persona, data.concepto, data.monto, data.moneda, data.tc];
    } else {
      fila = ['GASTO', data.fecha, '-', data.concepto, data.monto, data.moneda, data.tc];
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'NOMBRE_DE_TU_PESTAÑA!A:G', // <--- CAMBIÁ "NOMBRE_DE_TU_PESTAÑA"
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [fila],
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
