import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Rango que abarca desde O11 hasta O12
    const range = "'Aportesygastos'!O11:O12"; 

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range,
    });

    // Devolvemos los valores: [[Omar], [Pablo]]
    return res.status(200).json(response.data.values);
  } catch (error) {
    console.error('Error de lectura:', error);
    return res.status(500).json({ error: error.message });
  }
}
