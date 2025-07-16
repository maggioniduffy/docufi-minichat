import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // if on Vercel

export async function POST(req: NextRequest) {
  console.log("Upload request received");
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Prepare proxy to Express API
  const uploadRes = await fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData,
  });

  const body = await uploadRes.json();
  return new NextResponse(JSON.stringify(body), {
    status: uploadRes.status,
    headers: { "Content-Type": "application/json" },
  });
}
