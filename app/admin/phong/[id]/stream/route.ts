// app/admin/phong/[id]/stream/route.ts
export const runtime = "nodejs";

type TrangThai = "Đang chơi" | "Hoàn thành" | "Bị loại";

type NguoiChoi = {
  id: string;
  ten: string;
  vaiTro: string;
  diem: number;
  trangThai: TrangThai;
  buocHienTai: number;
  tongBuoc: number;
};

type TopoNode = {
  id: string;
  label: string;
  type: "router" | "switch" | "server" | "pc" | "siem";
  up: boolean;
  cpu: number;
  infected: boolean;
};

type TopoLink = {
  id: string;
  from: string;
  to: string;
  up: boolean;
  rtt: number;
};

function jsonSSE(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toTime(ts: number) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sessionStart = Date.now();

  let players: NguoiChoi[] = [
    { id: "p1", ten: "Nguyễn A", vaiTro: "Blue Team", diem: 120, trangThai: "Đang chơi", buocHienTai: 3, tongBuoc: 8 },
    { id: "p2", ten: "Trần B", vaiTro: "Red Team", diem: 180, trangThai: "Hoàn thành", buocHienTai: 8, tongBuoc: 8 },
    { id: "p3", ten: "Lê C", vaiTro: "SOC", diem: 95, trangThai: "Đang chơi", buocHienTai: 4, tongBuoc: 10 },
    { id: "p4", ten: "Phạm D", vaiTro: "IR", diem: 60, trangThai: "Đang chơi", buocHienTai: 2, tongBuoc: 7 },
  ];

  const baseNodes: TopoNode[] = [
    { id: "r1", label: "Gateway", type: "router", up: true, cpu: 28 },
    { id: "sw1", label: "Core SW", type: "switch", up: true, cpu: 18 },
    { id: "web", label: "Web (DMZ)", type: "server", up: true, cpu: 35 },
    { id: "db", label: "DB (LAN)", type: "server", up: true, cpu: 42 },
    { id: "siem", label: "SIEM", type: "siem", up: true, cpu: 38 },
    { id: "client", label: "Client VLAN", type: "pc", up: true, cpu: 22 },
  ];

  let nodes = baseNodes.map((node) => ({ ...node, infected: false }));

  const baseLinks: TopoLink[] = [
    { id: "r1-sw1", from: "r1", to: "sw1", up: true, rtt: 2.1 },
    { id: "sw1-web", from: "sw1", to: "web", up: true, rtt: 3.2 },
    { id: "sw1-db", from: "sw1", to: "db", up: true, rtt: 4.6 },
    { id: "sw1-siem", from: "sw1", to: "siem", up: true, rtt: 5.1 },
    { id: "sw1-client", from: "sw1", to: "client", up: true, rtt: 1.8 },
  ];

  let links = baseLinks.map((link) => ({ ...link }));

  const adjacency = baseLinks.reduce<Record<string, string[]>>((acc, link) => {
    acc[link.from] = acc[link.from] || [];
    acc[link.to] = acc[link.to] || [];
    acc[link.from].push(link.to);
    acc[link.to].push(link.from);
    return acc;
  }, {});

  let infected = new Set<string>(["web"]);

  let interval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      controller.enqueue(
        encoder.encode(
          jsonSSE({
            type: "hello",
            roomId: id,
            ts: Date.now(),
            sessionStart,
          })
        )
      );

      interval = setInterval(() => {
        const now = Date.now();

        players = players.map((p) => {
          if (p.trangThai !== "Đang chơi") return p;
          const roll = Math.random();
          const diemMoi = p.diem + Math.floor(Math.random() * 6);
          const stepDelta = Math.random() > 0.6 ? 1 : 0;
          const buocMoi = Math.min(p.tongBuoc, p.buocHienTai + stepDelta);
          if (roll < 0.05) return { ...p, diem: diemMoi, trangThai: "Bị loại", buocHienTai: buocMoi };
          if (buocMoi >= p.tongBuoc || roll < 0.14)
            return { ...p, diem: diemMoi + 8, trangThai: "Hoàn thành", buocHienTai: p.tongBuoc };
          return { ...p, diem: diemMoi, buocHienTai: buocMoi };
        });

        nodes = nodes.map((node) => {
          const dao = node.id === "web" || node.id === "siem";
          const up = dao ? Math.random() > 0.07 : Math.random() > 0.02;
          return { ...node, up, cpu: Math.floor(15 + Math.random() * 55) };
        });

        const nodeUp = Object.fromEntries(nodes.map((n) => [n.id, n.up]));
        links = links.map((link) => {
          const up = nodeUp[link.from] && nodeUp[link.to] && Math.random() > 0.04;
          const rtt = +(1 + Math.random() * 8).toFixed(1);
          return { ...link, up, rtt };
        });

        const newInfected: string[] = [];
        if (Math.random() > 0.45) {
          for (const src of Array.from(infected)) {
            const neighbors = adjacency[src] || [];
            for (const dst of neighbors) {
              if (infected.has(dst)) continue;
              const linkId = `${src}-${dst}`;
              const link =
                links.find((l) => l.from === src && l.to === dst) ||
                links.find((l) => l.from === dst && l.to === src);
              if (!link?.up) continue;
              if (Math.random() > 0.6) {
                infected.add(dst);
                newInfected.push(dst);
              }
            }
          }
        }

        nodes = nodes.map((node) => ({ ...node, infected: infected.has(node.id) }));

        const event =
          newInfected.length > 0
            ? {
                thoiGian: toTime(now),
                noiDung: `Mã độc lan tới: ${newInfected.map((id) => id.toUpperCase()).join(", ")}.`,
              }
            : Math.random() > 0.68
            ? { thoiGian: toTime(now), noiDung: "Cập nhật trạng thái topo và điểm người chơi." }
            : null;

        const payload = {
          type: "snapshot",
          ts: now,
          roomId: id,
          sessionStart,
          players,
          topo: { nodes, links },
          event,
        };

        controller.enqueue(encoder.encode(jsonSSE(payload)));
      }, 1000);
    },
    cancel() {
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
