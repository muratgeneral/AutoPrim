import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const csdStartDateStr = searchParams.get('csdStartDate'); 
  const csdEndDateStr = searchParams.get('csdEndDate'); 
  const offerStartDateStr = searchParams.get('offerStartDate'); 
  const offerEndDateStr = searchParams.get('offerEndDate'); 
  const sirkodStr = searchParams.get('sirkod') || '1';

  if (!csdStartDateStr || !csdEndDateStr || !offerStartDateStr || !offerEndDateStr) {
    return NextResponse.json({ error: 'All date parameters (CSD and Offer) are required' }, { status: 400 });
  }

  try {
    const pool = await getConnection();
    
    // User's provided Query for Sales Consultant
    const query = `
      SELECT
          t.SASINO AS VIN,
          a.marka AS MARKA,
          a.ustmodel AS [Product Line],
          m.ACIKLAMA AS MODEL_ACIKLAMA,
          k.ADISOY AS SATIS_DANISMANI,
          f.UNVAN AS MUSTERI_UNVAN,
          t.TEKLIFTAR,
          t.CSDDATE,
          t.TAVMAKTAR
      FROM [37.131.251.91, 10168].[peugeotdms].[dbo].[ATEKLIF0] AS t

      JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[GNLKULL0] AS k
          ON k.SICILNO = t.SATICISICIL
        AND k.SIRKOD  = t.SIRKOD

      JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[AARAC0] AS a
          ON a.SASINO = t.SASINO
        AND a.SIRKOD = t.SIRKOD

      LEFT JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[AMODEL0] AS m
          ON m.SIRKOD = a.SIRKOD
        AND m.MODEL  = a.MODEL

      LEFT JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[GNLFIRMA0] AS f
          ON f.SIRKOD  = t.SIRKOD
        AND f.VERGINO = t.FIRMA

      WHERE
          t.CSDDATE >= '${csdStartDateStr} 00:00:00.000'
          AND t.CSDDATE < '${csdEndDateStr} 00:00:00.000'
          AND t.GECERTAR >= '${offerStartDateStr} 00:00:00.000'
          AND t.GECERTAR < '${offerEndDateStr} 00:00:00.000'
          AND t.SIRKOD = ${Number(sirkodStr)}

      ORDER BY t.SASINO, t.SIRKOD;
    `;

    const request = pool.request();
    const result = await request.query(query);
    
    return NextResponse.json({ data: result.recordset, sqlQuery: query });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
  }
}
