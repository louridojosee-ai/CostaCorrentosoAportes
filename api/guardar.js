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
    
    // A: Tipo | B: Fecha | C: Monto | D: TC | E: Aportante | F: Concepto
const tipoFormateado = data.tipo === 'APORTE' ? 'Aporte' : 'Gasto';

    const fila = [
      tipoFormateado, // <--- Ahora usa la versión prolija
      data.fecha,
      data.monto,
      data.tc || '1',
      data.tipo === 'APORTE' ? data.persona : '-',
      data.concepto
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "'Aportesygastos'!A:F", // <--- CAMBIÁ ESTO POR EL NOMBRE DE TU HOJA
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [fila] },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error de Google:', error);
    return res.status(500).json({ error: error.message });
  }
}
