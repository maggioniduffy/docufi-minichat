import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { docId, topic } = body;

    if (!topic || !docId) {
      return NextResponse.json({ error: "No topic or docId provided" }, { status: 400 });
    }

    const backendRes = await fetch("http://backend:5000/outline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId, topic }),
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Backend outline failed" }, { status: 500 });
    }

    const data = await backendRes.json();
    return NextResponse.json({ outline: data.outline });
  } catch (error) {
    console.error("Error in outline route:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}