"use client";

import { Frame, MoreHorizontal, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  id: string;
  title: string;
  createdAt: string;
  verdict: string;
};

export function NavHistory() {
  const { isMobile } = useSidebar();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/arb/sessions?limit=10");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const deleteSession = async (id: string) => {
    try {
      if (!confirm("Are you sure you want to delete this session?")) return;

      const res = await fetch(`/api/arb/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== id));
        router.push("/board-room");
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Proposals</SidebarGroupLabel>
      <SidebarMenu>
        {loading ? (
          <div className="text-xs text-muted-foreground px-2 py-1">
            Loading...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-xs text-muted-foreground px-2 py-1">
            No recent proposals
          </div>
        ) : (
          sessions.map((session) => (
            <SidebarMenuItem key={session.id}>
              <SidebarMenuButton asChild>
                <Link href={`/board-room/${session.id}`}>
                  <Frame className="text-muted-foreground" />
                  <span className="truncate">{session.title}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => deleteSession(session.id)}>
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete Session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}

        {!loading && sessions.length >= 10 && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-muted-foreground">
              <Link href="/board-room/history">
                <MoreHorizontal className="text-muted-foreground" />
                <span>View More</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
