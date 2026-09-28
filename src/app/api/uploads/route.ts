import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Same-site only: this endpoint writes to the public CDN, so a script elsewhere must not be able to use it.
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
    let sameSite = false;
    try { sameSite = !!origin && new URL(origin).host === host; } catch { sameSite = false; }
    if (!sameSite) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawName = formData.get("fileName") as string | null;
    if (file && file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File is larger than 25 MB" }, { status: 413 });
    }
    // Nothing that a browser would run or render as a page: stops the CDN being used to host phishing pages.
    const BLOCKED = /\.(html?|xhtml|svg|js|mjs|php)$/i;
    const BLOCKED_TYPES = /^(text\/html|application\/xhtml\+xml|image\/svg\+xml|(application|text)\/javascript)/i;
    if (file && (BLOCKED.test(rawName ?? "") || BLOCKED.test(file.name) || BLOCKED_TYPES.test(file.type))) {
      return NextResponse.json({ success: false, error: "That file type can't be uploaded" }, { status: 415 });
    }
    // Safe characters only, plus a random prefix so an upload can never overwrite an existing file.
    const fileName = rawName
      ? `${crypto.randomUUID().slice(0, 8)}_${rawName.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120)}`
      : null;
    const apiKey = process.env.BUNNY_STORAGE_UPLOAD_KEY;
    const emailSender = process.env.EMAIL_SENDER;
    const emailReceiver = process.env.EMAIL_SENDER;

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