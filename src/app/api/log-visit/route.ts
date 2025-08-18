// api/log-visit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  try {
    await resend.emails.send({
      from: process.env.EMAIL_SENDER || "no-reply@mudderfuger.ai",
      to: process.env.EMAIL_RECEIVER || "no-reply@mudderfuger.ai", // fallback if missing
      cc: process.env.EMAIL_CC || undefined,
      bcc: process.env.EMAIL_BCC || undefined,
      subject: `${email} just visited mudderfuger.ai`,
      html: `<p>Email: <b>${email}</b></p><p>Time: ${new Date().toISOString()}</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send email:", err);
    return NextResponse.json({ ok: false, error: "Failed to send email" }, { status: 500 });
  }
}