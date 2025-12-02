import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Reaction from "@/models/reaction";
import Visitor from "@/models/visitor";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("visitorId");

    const reactions = await Reaction.aggregate([
      { $match: { markdown: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: Record<string, number> = {};
    reactions.forEach((r) => {
      counts[r._id] = r.count;
    });

    let userReactions: string[] = [];
    if (visitorId) {
      const userReacts = await Reaction.find({
        markdown: id,
        visitor: visitorId,
      });
      userReactions = userReacts.map((r) => r.type);
    }

    return NextResponse.json({
      success: true,
      data: {
        counts,
        userReactions,
      },
    });
  } catch (error) {
    console.error("Fetch reactions error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { visitorId, type } = body;

    if (!visitorId || !type) {
      return NextResponse.json(
        { success: false, error: "VisitorId and type are required" },
        { status: 400 }
      );
    }

    // Verify visitor exists
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    // Check if already reacted with this emoji
    const existingReaction = await Reaction.findOne({
      markdown: id,
      visitor: visitorId,
      type: type,
    });

    if (existingReaction) {
      // Remove reaction
      await Reaction.findByIdAndDelete(existingReaction._id);
      return NextResponse.json({
        success: true,
        data: { reacted: false, type },
      });
    } else {
      // Add reaction
      await Reaction.create({
        markdown: id,
        visitor: visitorId,
        type: type,
      });
      return NextResponse.json({
        success: true,
        data: { reacted: true, type },
      });
    }
  } catch (error) {
    console.error("Toggle reaction error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
