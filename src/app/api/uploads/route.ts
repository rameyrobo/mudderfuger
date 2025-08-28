import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as string | null;
    const apiKey = process.env.BUNNY_STORAGE_UPLOAD_KEY;
    const emailSender = process.env.EMAIL_SENDER;
    const emailReceiver = process.env.EMAIL_RECEIVER;

    if (!file || !fileName || !apiKey || !emailSender || !emailReceiver) {
      return NextResponse.json(
        { success: false, error: "Missing file, fileName, API key, or email config" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bunnyUrl = `https://storage.bunnycdn.com/mudderfuger/_uploads/${encodeURIComponent(fileName)}`;
    const publicUrl = `https://mudderfuger.b-cdn.net/_uploads/${encodeURIComponent(fileName)}`;

    // Upload to Bunny
    const bunnyRes = await fetch(bunnyUrl, {
      method: "PUT",
      headers: {
        AccessKey: apiKey,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: Buffer.from(arrayBuffer),
    });

    if (!bunnyRes.ok) {
      const error = await bunnyRes.text();
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    // Send email with Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailSender,
        to: emailReceiver,
        subject: "New Mudderfuger Upload",
        html: `<p>A new file has been uploaded:</p>
               <p><a href="${publicUrl}">${publicUrl}</a></p>
               <p>Click the link to download the file.</p>`,
      }),
    });

    if (!resendRes.ok) {
      const error = await resendRes.text();
      return NextResponse.json({ success: false, error: "Upload succeeded but email failed: " + error }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}