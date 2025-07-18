import { NextRequest, NextResponse } from "next/server";
//import FormData from "form-data";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("Received upload request");
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file found in the request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("formData", formData);

    const uploadRes = await fetch("http://backend:5000/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ message: "Upload failed" }, { status: 500 });
    }

    const data = await uploadRes.json();
    console.log("Upload successful:", data);
    return NextResponse.json({ message: "Upload successful", data });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log("Deleting all facts");
    const res = await fetch("http://backend:5000/upload/clear", {
      method: "DELETE",
    });

    if (!res.ok) {
      return NextResponse.json({ message: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ message: "All documents deleted" });
  } catch (error) {
    console.error("Error deleting documents:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("Fetching all documents");
    const res = await fetch("http://backend:5000/upload/documents", {
      method: "GET",
    });

    if (!res.ok) {
      return NextResponse.json({ message: "Fetch failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({
      message: "Documents fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
