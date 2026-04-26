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
    const nombreHoja = 'Aportesygastos';

    // 1. Buscamos la última fila ocupada en columna A
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${nombreHoja}!A:A`,
    });

    const filasActuales = response.data.values ? response.data.values.length : 0;
    const proximaFila = filasActuales + 1;

    // 2. Determinar código para columna D
    let codigoD;
    if (data.tipo === 'APORTE') {
      codigoD = data.persona === 'Omar' ? 11 : 12; // Omar=11, Pablo=12
    } else {
      codigoD = 23; // Gastos siempre 23
    }

    // 3. Preparamos datos para columnas A a E
    const filaAE = [
      data.fecha,       // A: Fecha
      data.monto,       // B: Monto
      data.tc || '1',   // C: Tipo de cambio
      codigoD,          // D: Código (11, 12 o 23)
      data.caja,        // E: Código de caja (1, 2, 3 o 4)
    ];

    // 4. Escribimos A:E (sin tocar F y G que son fórmulas)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${nombreHoja}!A${proximaFila}:E${proximaFila}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [filaAE] },
    });

    // 5. Escribimos H (concepto) por separado para no pisar F y G
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${nombreHoja}!H${proximaFila}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[data.concepto]] },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
