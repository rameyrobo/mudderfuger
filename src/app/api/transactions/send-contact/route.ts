import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/* Spam screen (added 2026-09-28 after a bot wave hit another site's contact form). A held message
   gets a normal-looking reply and sends nothing. Signals: no Origin header (scripted POSTs), no `dt`
   (ms since page load, added by the modal's own script), under 3 s, the domains and name shape of
   that wave. */
const SPAM_DOMAINS = /(^|\.)(shakira12\.site|mail-topster\.org|mail220v\.org|pokamail\.com)$/i;
function spamReason(request: Request, dtRaw: unknown, name: string, email: string): string {
  if (!request.headers.get('origin')) return 'no origin';
  const dt = Number(dtRaw);
  if (!Number.isFinite(dt) || dt <= 0) return 'no script';
  if (dt < 3000) return 'too fast';
  if (SPAM_DOMAINS.test(email.split('@')[1] ?? '')) return 'blocked domain';
  if (/^[a-z]{5}_[A-Za-z]{4}$/.test(name)) return 'bot name';
  return '';
}

export async function POST(request: Request) {
  const { name, email, message, phone, dt } = await request.json();

  const held = spamReason(request, dt, String(name ?? ''), String(email ?? ''));
  if (held) {
    console.warn('contact form held:', held);
    return NextResponse.json({ data: null });
  }

  // Type assertion ensures sender is treated as a string
  const sender = process.env.EMAIL_SENDER as string;

  const { data, error } = await resend.emails.send({
    from: `Mudderfuger <${sender}>`,
    to: [sender],
    subject: `Contact Form Submission from ${String(name ?? '').slice(0, 120)}`,
    html: `<strong>From:</strong> ${esc(name)} (${esc(email)})<br/><strong>Phone:</strong> ${esc(phone)}<br/><br/>${esc(message).replace(/\n/g, '<br/>')}`,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}
