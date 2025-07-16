import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  const { data, error } = await resend.emails.send({
    from: `Mudderfuger <${sender}>`,
    to: [sender],
    subject: `Contact Form Submission from ${name}`,
    html: `<strong>From:</strong> ${name} (${email})<br/><br/>${message}`,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}