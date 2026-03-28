import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();

  const endpoints = [
    `https://dayoffapi.vercel.app/api?year=${year}`,
    `https://api-harilibur.vercel.app/api?year=${year}`,
    `https://api-harilibur.vercel.app/api/holidays?year=${year}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        
        // Normalize if it's api-harilibur (which has holiday_date/holiday_name)
        if (Array.isArray(data) && data.length > 0 && data[0].holiday_date) {
          const normalized = data.map((h: any) => ({
            tanggal: h.holiday_date,
            keterangan: h.holiday_name,
            is_cuti: !h.is_national_holiday
          }));
          return NextResponse.json(normalized);
        }
        
        // Otherwise assume it's already normalized (dayoffapi format)
        if (Array.isArray(data)) {
          return NextResponse.json(data);
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch from ${endpoint}:`, e);
    }
  }

  return NextResponse.json({ error: 'All holiday APIs failed' }, { status: 500 });
}
