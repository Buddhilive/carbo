"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Copy, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VerdictBadge } from "@/components/arb/VerdictBadge";

type SessionInfo = {
  id: string;
  title: string;
  createdAt: string;
  verdict:
    | "approved"
    | "approved-with-conditions"
    | "rejected"
    | "pending"
    | "completed";
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/arb/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const res = await fetch(`/api/arb/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete session.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Session History</h2>
          <p className="text-muted-foreground">
            Manage your past Architecture Review Board sessions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/board-room">New Proposal</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>
            {sessions.length} total sessions recorded in the database.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6 w-full overflow-auto">
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading session history...
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No sessions found. Start a new ARB review.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {session.title}
                    </TableCell>
                    <TableCell>
                      {format(new Date(session.createdAt), "PPP")}
                    </TableCell>
                    <TableCell>
                      {session.verdict === "pending" ? (
                        <span className="text-xs text-muted-foreground italic">
                          In Progress
                        </span>
                      ) : (
                        <VerdictBadge verdict={session.verdict as any} />
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyId(session.id)}
                        title="Copy Session ID"
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        title="View Session"
                      >
                        <Link href={`/board-room/${session.id}`}>
                          <Eye className="h-4 w-4 text-primary" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(session.id)}
                        title="Delete Session"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
