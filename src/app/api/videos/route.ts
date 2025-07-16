// src/app/api/videos/route.ts
import { NextResponse } from 'next/server';

type VideoFile = {
  ObjectName: string;
};

export async function GET() {
  const apiKey = process.env.BUNNY_STORAGE_API_KEY;

  const response = await fetch('https://storage.bunnycdn.com/mudderfuger/_vids/', {
    method: 'GET',
    headers: {
      accept: 'application/json',
      AccessKey: apiKey || '',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bunny API error:', response.status, errorText);
    return NextResponse.json({ error: 'Failed to fetch Bunny videos' }, { status: 500 });
  }

  const files = await response.json();

  const videos = (files as VideoFile[])
    .filter((f) => f.ObjectName.endsWith('.mp4'))
    .map((file) => {
      const filename = file.ObjectName;
      const base = filename.replace('.mp4', '');
      const [idPart, ...rest] = base.split('_');
      const id = parseInt(idPart);
      const titlePart = rest.join(' ').replace(/-/g, ' ');
      return {
        id,
        title: `ep${id}: ${titlePart}`,
        url: `https://mudderfuger.b-cdn.net/_vids/${filename}`,
      };
    })
    .sort((a, b) => a.id - b.id);

  return NextResponse.json(videos);
}