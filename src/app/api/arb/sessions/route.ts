import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParams = searchParams.get("limit");
    const limit = limitParams ? parseInt(limitParams, 10) : undefined;

    const sessions = await prisma.aRBSession.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        // We only fetch adr loosely to determine verdict, not full payload
        adr: true,
      },
    });

    // Parse the verdict out from the strings, to keep API payload small
    const serializedSessions = sessions.map(
      (s: {
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        adr: string | null;
      }) => {
        let verdict = "pending";
        if (s.adr) {
          try {
            const parsedAdr = JSON.parse(s.adr);
            verdict = parsedAdr.verdict || "completed";
          } catch {
            verdict = "completed";
          }
        }

        return {
          id: s.id,
          title: s.title,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          verdict,
        };
      },
    );

    return NextResponse.json({ sessions: serializedSessions });
  } catch (error) {
    console.error("Failed to fetch sessions", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
