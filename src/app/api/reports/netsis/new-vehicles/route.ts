import { NextResponse } from 'next/server';
import { getNetsisConnection } from '@/lib/dbNetsis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sirkod = searchParams.get('sirkod') || '1';
    
    // We will use OtomotivMuhasebeAracSatisVeStokListesi for testing because it has rich data columns
    // If it fails with "Invalid object Name", we will test the EFES view in the error fallback.

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Başlangıç ve Bitiş tarihleri zorunludur.' }, { status: 400 });
    }

    const pool = await getNetsisConnection();

    // Dynamic SQL to filter by Date and Brand (Sirkod mapped to Proje_Kodu)
    let projeKodu = '';
    if (sirkod === '1') projeKodu = '98-91';
    else if (sirkod === '2') projeKodu = '98-92';
    else if (sirkod === '3') projeKodu = '98-93';

    const query = `
      -- 1) Pre-cache the Campaign records to eliminate O(N^2) cross-database scans
      SELECT EKALAN, STHAR_BF 
      INTO #Kampanya
      FROM GIDA2026..TBLSTHAR 
      WHERE EKALAN_NEDEN = '1'
      
      INSERT INTO #Kampanya
      SELECT EKALAN, STHAR_BF 
      FROM GIDA2025..TBLSTHAR 
      WHERE EKALAN_NEDEN = '1'

      -- 2) Execute the main fetch query
      SELECT 
          m.FATIRS_NO as FaturaNo, 
          CONVERT(varchar, m.TARIH, 104) as Tarih, 
          e.ACIK13 as SasiNo,
          REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.CARI_ISIM, 'Ý', 'İ'), 'ý', 'ı'), 'Þ', 'Ş'), 'þ', 'ş'), 'Ð', 'Ğ'), 'ð', 'ğ') as [Müşteri Adı],
          e.ACIK2 as [Alış Fatura No],
          alis.AlisTarih as [Alış Fatura Tarihi],
          alis.AlisTutari as [Araç Alış Tutarı],
          CAST(m.GENELTOPLAM as decimal(18,2)) as [KDV Dahil Satis],
          CAST(m.BRUTTUTAR as decimal(18,2)) as [Vergiler Haric Satis],
          ISNULL(kampanya.KampanyaTutari, 0) as [Kampanya Tutarı],
          -- Extract text between "MODEL:" and " YIL"
          LTRIM(RTRIM(
            SUBSTRING(
                e.ACIK8, 
                CHARINDEX('MODEL:', e.ACIK8) + 6, 
                CASE 
                    WHEN CHARINDEX(' YIL:', e.ACIK8) > 0 THEN 
                        CHARINDEX(' YIL:', e.ACIK8) - (CHARINDEX('MODEL:', e.ACIK8) + 6)
                    ELSE LEN(e.ACIK8) 
                END
            )
          )) as Model
      FROM 
          GIDA2026..TBLFATUIRS m
      LEFT JOIN 
          GIDA2026..TBLFATUEK e ON m.FATIRS_NO = e.FATIRSNO
      LEFT JOIN 
          GIDA2026..TBLCASABIT c ON m.CARI_KODU = c.CARI_KOD
      OUTER APPLY (
          SELECT TOP 1 
              CONVERT(varchar, pInfo.TARIH, 104) as AlisTarih,
              CAST(pInfo.BRUTTUTAR as decimal(18,2)) as AlisTutari
          FROM (
              SELECT m2.FATIRS_NO, m2.TARIH, m2.BRUTTUTAR, e2.ACIK13
              FROM GIDA2026..TBLFATUIRS m2
              JOIN GIDA2026..TBLFATUEK e2 ON m2.FATIRS_NO = e2.FATIRSNO
              WHERE m2.FTIRSIP != '1'
              UNION ALL
              SELECT m2.FATIRS_NO, m2.TARIH, m2.BRUTTUTAR, e2.ACIK13
              FROM GIDA2025..TBLFATUIRS m2
              JOIN GIDA2025..TBLFATUEK e2 ON m2.FATIRS_NO = e2.FATIRSNO
              WHERE m2.FTIRSIP != '1'
          ) pInfo
          WHERE pInfo.ACIK13 = e.ACIK13
          ORDER BY pInfo.TARIH DESC
      ) alis
      OUTER APPLY (
          SELECT CAST(SUM(kInfo.STHAR_BF) as decimal(18,2)) as KampanyaTutari
          FROM #Kampanya kInfo
          WHERE e.ACIK13 IS NOT NULL 
            AND LEN(e.ACIK13) >= 6 
            AND kInfo.EKALAN LIKE '%' + RIGHT(e.ACIK13, 6) + '%'
      ) kampanya
      WHERE 
          m.FTIRSIP = '1'
          AND m.SUBE_KODU = 6
          AND m.PROJE_KODU = @projeKodu
          AND m.TARIH >= @startDate 
          AND m.TARIH <= @endDate
          AND e.ACIK13 IS NOT NULL
          AND e.ACIK13 != ''
          AND e.ACIK7 LIKE '%ARAÇ SATIS FATURASI TEKLIF NO%'
      ORDER BY 
          m.TARIH ASC

      -- 3) Clean up TempTable
      DROP TABLE #Kampanya
    `;

    const requestObj = pool.request();
    requestObj.input('startDate', startDate);
    requestObj.input('endDate', endDate);
    requestObj.input('projeKodu', projeKodu);
    
    // Using simple query string to show to developer
    const rawSqlStr = query
      .replace('@startDate', `'${startDate}'`)
      .replace('@endDate', `'${endDate}'`)
      .replace('@projeKodu', `'${projeKodu}'`);

    const result = await requestObj.query(query);

    const mappedData = result.recordset.map((row: any, index: number) => {
      const alisMaliyeti = Number(row['Araç Alış Tutarı']) || 0;
      const kdvDahilSatis = Number(row['KDV Dahil Satis']) || 0;
      const vergilerHaricSatis = Number(row['Vergiler Haric Satis']) || 0;
      const kampanya = Number(row['Kampanya Tutarı']) || 0;

      let satisKari = 0;
      let kampDahilKar = 0;
      let kampHaricKar = 0;

      if (vergilerHaricSatis > 0) {
        satisKari = vergilerHaricSatis - alisMaliyeti;
        kampDahilKar = (satisKari + kampanya) / vergilerHaricSatis;
        kampHaricKar = satisKari / vergilerHaricSatis;
      }

      return {
        'Satış Tarihi': row['Tarih'],
        'Fatura No': row['FaturaNo'],
        'AÇIKLAMA': 'Müşteri',
        'Sıra No': index + 1,
        'Alış Fatura Tarihi': row['Alış Fatura Tarihi'],
        'Alış Fatura No': row['Alış Fatura No'],
        'ARAÇ MODELİ': row['Model'],
        'ARAÇ ŞASİ NO': row['SasiNo'],
        'SİPARİŞ NO': '',
        'ARAÇ': alisMaliyeti,
        'NAKLİYE': 0,
        'ÖTV': 0,
        'Alış Maliyeti Toplamı': alisMaliyeti,
        'KDV Dahil Satış Fat. Toplamı': kdvDahilSatis,
        'Vergiler Hariç Satış Tutarı': vergilerHaricSatis,
        'Kampanya Tutarı': kampanya,
        'FLEXCARE': '',
        'Satış Karı': satisKari,
        'Kamp. Dahil Kar': Number((kampDahilKar * 100).toFixed(2)) + '%',
        'Kamp. Hariç Kar': Number((kampHaricKar * 100).toFixed(2)) + '%',
        'Müşteri Adı': row['Müşteri Adı']
      };
    });

    return NextResponse.json({ data: mappedData, sqlQuery: rawSqlStr });


  } catch (error: any) {
    console.error('Netsis API Error:', error);
    return NextResponse.json({ error: 'Netsis veritabanı sorgusu başarısız oldu: ' + error.message }, { status: 500 });
  }
}
