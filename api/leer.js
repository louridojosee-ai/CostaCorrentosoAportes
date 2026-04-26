import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Leer movimientos (Columnas A a H)
    const resMovimientos = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Aportesygastos'!A:H",
    });

    const todasLasFilas = resMovimientos.data.values || [];
    // Filtramos filas vacías y sacamos las últimas 4
    const ultimos4 = todasLasFilas.filter(f => f[0]).slice(-4).reverse();

    return res.status(200).json({
      movimientos: ultimos4,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
