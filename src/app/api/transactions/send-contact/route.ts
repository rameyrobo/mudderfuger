import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function sanitizeHeader(str: string) {
  return str.replace(/(\r\n|\n|\r)/gm, " ");
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m] as string));
}

export async function POST(request: Request) {
  const { name, email, message, phone } = await request.json();

  // Basic email validation
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const sender = process.env.EMAIL_SENDER as string;
  const receiver = process.env.EMAIL_RECEIVER as string;
  const cc = process.env.EMAIL_CC as string;
  const bcc = process.env.EMAIL_BCC as string;

  const safeName = sanitizeHeader(name || "");
  const safeEmail = sanitizeHeader(email || "");
  const safeSubject = `Contact Form Submission from ${safeName}`;
  const safeMessage = escapeHtml(message || "");
  const safePhone = escapeHtml(phone || "");

  const { data, error } = await resend.emails.send({
    from: `Mudderfuger <${sender}>`,
    to: receiver,
    cc,   // use the variable
    bcc,  // use the variable
    subject: safeSubject,
    html: `<strong>From:</strong> ${escapeHtml(safeName)} (${escapeHtml(safeEmail)})<br/><strong>Phone:</strong> ${safePhone}<br/><br/>${safeMessage}`,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}