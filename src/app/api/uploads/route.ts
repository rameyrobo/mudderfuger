import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as string | null;
    const apiKey = process.env.BUNNY_STORAGE_UPLOAD_KEY;
    console.log("API upload:", { file, fileName, apiKey });

    if (!file || !fileName || !apiKey) {
      console.log("Missing something:", { file, fileName, apiKey });
      return NextResponse.json(
        { success: false, error: "Missing file, fileName, or API key" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const url = `https://storage.bunnycdn.com/mudderfuger/_uploads/${encodeURIComponent(
      fileName
    )}`;

    const bunnyRes = await fetch(url, {
      method: "PUT",
      headers: {
        AccessKey: apiKey,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: Buffer.from(arrayBuffer),
    });

    if (bunnyRes.ok) {
      return NextResponse.json({ success: true, url });
    } else {
      const error = await bunnyRes.text();
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}