import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const pool = await getConnection();
    
    const query = `
      SELECT t.SASENO, t.KAMPANYA, t.KAMPANYATUT, t.INDIRIM, t.SOZLESME, t.TOPTUT, t.ISKONTO, t.TICARIISK, t.EKISKONTO, t.FILOISK, t.DIGERISK
      FROM OPENQUERY([37.131.251.91, 10168], '
        SELECT SASENO, KAMPANYA, KAMPANYATUT, INDIRIM, SOZLESME, TOPTUT, ISKONTO, TICARIISK, EKISKONTO, FILOISK, DIGERISK
        FROM peugeotdms.dbo.TEKLIF 
        WHERE SASENO = ''VF3YDG6F8SG065660''
      ') t
    `;
    
    const result = await pool.request().query(query);
    return NextResponse.json(result.recordset);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
