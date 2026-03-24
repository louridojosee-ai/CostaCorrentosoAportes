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
    
    // MAPA DE COLUMNAS SEGÚN TU EXCEL:
    // A: Aporte/Gasto | B: Fecha | C: Monto | D: TC | E: Aportante | F: Concepto
    let fila = [];
    
    if (data.tipo === 'APORTE') {
      fila = [
        'APORTE',      // Columna A
        data.fecha,    // Columna B
        data.monto,    // Columna C
        data.tc,       // Columna D
        data.persona,  // Columna E (Pablo/Omar)
        data.concepto  // Columna F
      ];
    } else {
      fila = [
        'GASTO',       // Columna A
        data.fecha,    // Columna B
        data.monto,    // Columna C
        data.tc,       // Columna D
        '-',           // Columna E (Gasto no tiene aportante)
        data.concepto  // Columna F
      ];
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Aportesygastos!A:F", // <--- IMPORTANTE: Reemplazá NOMBRE_DE_TU_HOJA por el nombre real de la pestaña
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
