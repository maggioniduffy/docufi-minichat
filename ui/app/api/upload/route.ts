import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("Received upload request");
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const proxyForm = new FormData();

    proxyForm.append("file", buffer, {
      filename: file.name,
      contentType: file.type, // This should be "application/pdf" for PDFs
    });
    const uploadRes = await fetch("http://backend:5000/upload", {
      method: "POST",
      body: proxyForm as any,
      headers: proxyForm.getHeaders(),
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ message: "Upload failed" }, { status: 500 });
    }

    const data = await uploadRes.json();
    return NextResponse.json({ message: "Upload successful", data });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
