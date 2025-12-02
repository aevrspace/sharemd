import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Markdown from "@/models/markdown";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // In Next.js 15+, params is a Promise
    const { id } = await params;

    const markdown = await Markdown.findById(id);

    if (!markdown) {
      return NextResponse.json(
        { success: false, error: "Markdown not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: markdown.content,
        title: markdown.title,
        createdAt: markdown.createdAt,
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { content, title } = body;

    if (!content && !title) {
      return NextResponse.json(
        { success: false, error: "Content or title is required" },
        { status: 400 }
      );
    }

    const updateData: { content?: string; title?: string } = {};
    if (content) updateData.content = content;
    if (title) updateData.title = title;

    const markdown = await Markdown.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!markdown) {
      return NextResponse.json(
        { success: false, error: "Markdown not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: markdown.content,
        title: markdown.title,
        createdAt: markdown.createdAt,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
