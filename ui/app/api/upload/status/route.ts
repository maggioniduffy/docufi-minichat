import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const docId = req.nextUrl.searchParams.get("docId");
  if (!docId) {
    return NextResponse.json({ error: "Missing docId" }, { status: 400 });
  }

  try {
    const backendRes = await fetch(`http://backend:5000/upload/status?docId=${docId}`);
    if (!backendRes.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: 500 });
    }
    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}