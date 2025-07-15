// src/pages/api/send-contact.ts
import { type NextRequest, NextResponse } from 'next/server';
import Email from 'vercel-email';

export const config = { runtime: 'edge' };

export async function POST(req: NextRequest) {
  if (req.method?.toUpperCase() !== 'POST') {
    return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
  }

  const body = await req.json();
  const { name, email, message } = body;

  try {
    await Email.send({
      to: process.env.EMAIL_SENDER!,
      from: { email: process.env.EMAIL_SENDER!, name: 'Mudderfuger Contact Form' },
      subject: `New Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}