import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Markdown from "@/models/markdown";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;
    let title = formData.get("title") as string;

    let content = "";

    if (file) {
      content = await file.text();
      if (!title) {
        title = file.name;
      }
    } else if (text) {
      content = text;
      if (!title) {
        title = "Untitled Markdown";
      }
    } else {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    const markdown = await Markdown.create({ content, title });

    return NextResponse.json({
      success: true,
      data: {
        id: markdown._id,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
