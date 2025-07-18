import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("Received conversation request");
    const { query, docId } = await req.json();

    if (!query || !docId) {
      console.error("Missing query or docId in the request");
      return NextResponse.json(
        { error: "Missing query or docId" },
        { status: 400 }
      );
    }

    const uploadRes = await fetch("http://backend:5000/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ docId, query }),
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ message: "Upload failed" }, { status: 500 });
    }

    const data = await uploadRes.json();
    return NextResponse.json({ message: "Conversation successful", data });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
