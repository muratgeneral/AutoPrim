import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

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
    
    const query = `
      SELECT 
          ROW_NUMBER() OVER (ORDER BY t.SASINO) AS Sira,
          t.SASINO AS [Şasi No],
          a.USTMODEL AS [Model],
          ISNULL(inv_agg.SumStandartBRFIYAT, 0) + ISNULL(a.DISTPROMTUT, 0) AS [Net Tutar],
          ISNULL(a.DISTPROMTUT, 0) AS [Promosyon],
          kamp_agg.KampanyaDetay AS [Kampanya],
          ISNULL(kamp_agg.KampanyaToplam, 0) AS [Kampanya Toplamı],
          k.ADISOY AS [Satış Danışmanı]
      FROM [37.131.251.91, 10168].[peugeotdms].[dbo].[ATEKLIF0] AS t

      JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[GNLKULL0] AS k
          ON k.SICILNO = t.SATICISICIL
         AND k.SIRKOD  = t.SIRKOD

      JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[AARAC0] AS a
          ON a.SASINO = t.SASINO
         AND a.SIRKOD = t.SIRKOD

      -- 1) Satınalma (Gelen) Faturaları (En güncel fatura)
      OUTER APPLY (
          SELECT TOP 1 
              fm_sub.FATNO
          FROM [37.131.251.91, 10168].[peugeotdms].[dbo].[UFATMAS0] fm_sub
          JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[UFATDET0] fd_sub ON fm_sub.FATNO = fd_sub.FATNO
          WHERE fm_sub.EFATNO LIKE 'PE%' AND fd_sub.SASINO = a.SASINO
          ORDER BY fm_sub.FATTAR DESC, fm_sub.FATNO DESC
      ) fm

      -- 2) Nett Amount hesabı icin Subquery
      OUTER APPLY (
          SELECT 
              SUM(CASE WHEN fd_agg.DMBGRUP = 'STANDART' THEN fd_agg.BRFIYAT ELSE 0 END) AS SumStandartBRFIYAT
          FROM [37.131.251.91, 10168].[peugeotdms].[dbo].[UFATDET0] fd_agg
          WHERE fd_agg.FATNO = fm.FATNO AND fd_agg.SASINO = a.SASINO
      ) inv_agg

      -- 3) Kampanya/İskonto Kırılımlarını Çekme
      OUTER APPLY (
          SELECT 
              STRING_AGG(CONVERT(NVARCHAR(MAX), kamp.ACIKLAMA + ' (' + CAST(isk.DISTTUT AS NVARCHAR(50)) + ')'), ', ') AS KampanyaDetay,
              SUM(isk.DISTTUT) AS KampanyaToplam
          FROM [37.131.251.91, 10168].[peugeotdms].[dbo].[ATEKLIFISK0] isk
          JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[AARACKAMPANYA] kamp 
              ON kamp.SIRKOD = isk.SIRKOD AND kamp.KAMPANYANO = isk.KAMPANYANO
          WHERE isk.TEKLIFNO = t.TEKLIFNO AND isk.SIRKOD = t.SIRKOD AND isk.DISTTUT > 0
      ) kamp_agg

      WHERE
           t.CSDDATE >= '${csdStartDateStr} 00:00:00.000'
          AND t.CSDDATE < '${csdEndDateStr} 00:00:00.000'
          AND t.GECERTAR >= '${offerStartDateStr} 00:00:00.000'
          AND t.GECERTAR < '${offerEndDateStr} 00:00:00.000'
          AND a.SIRKOD = ${Number(sirkodStr)}
      ORDER BY t.SASINO;
    `;

    const request = pool.request();
    const result = await request.query(query);
    
    return NextResponse.json({ data: result.recordset, sqlQuery: query });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
  }
}
