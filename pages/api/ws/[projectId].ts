import type { NextApiRequest, NextApiResponse } from 'next';
import http from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import type { IncomingMessage, Server as HTTPServer } from 'http';
import type { Socket } from 'net';
import { ensureHeartbeat, websocketManager } from '@/lib/server/websocket-manager';
import { previewManager } from '@/lib/services/preview';

type UpgradeListener = (request: IncomingMessage, socket: Socket, head: Buffer) => void;

type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      wss?: WebSocketServer;
      __ws_initialized__?: boolean;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

function isProjectWebSocketPath(pathname: string): boolean {
  return pathname === '/api/ws' || pathname.startsWith('/api/ws/');
}

function previewHmrTarget(pathname: string, search: string): { projectId: string; path: string } | null {
  const match = pathname.match(/^\/preview\/([^/]+)(\/.*)$/);
  if (!match) return null;
  return {
    projectId: decodeURIComponent(match[1]),
    path: `${match[2]}${search}`,
  };
}

function proxyPreviewWebSocket(request: IncomingMessage, socket: Socket, head: Buffer) {
  const upgradeUrl = new URL(request.url ?? '', 'http://localhost');
  const target = previewHmrTarget(upgradeUrl.pathname, upgradeUrl.search);
  if (!target) return false;

  const preview = previewManager.getStatus(target.projectId);
  if (!preview.port) {
    socket.destroy();
    return true;
  }

  const headers: http.OutgoingHttpHeaders = { ...request.headers, host: `127.0.0.1:${preview.port}` };
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: preview.port,
    path: target.path,
    method: 'GET',
    headers,
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    const lines = ['HTTP/1.1 101 Switching Protocols'];
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (value === undefined) continue;
      const rendered = Array.isArray(value) ? value.join(', ') : value;
      lines.push(`${key}: ${rendered}`);
    }
    socket.write(`${lines.join('\r\n')}\r\n\r\n`);
    if (head.length) proxySocket.write(head);
    if (proxyHead.length) socket.write(proxyHead);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  proxyReq.on('error', () => {
    socket.destroy();
  });
  proxyReq.end();
  return true;
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  // Initialize a shared WebSocket server on the underlying HTTP server once.
  const baseSocket = res.socket as any;
  if (!baseSocket?.server) {
    res.status(500).send('Socket server unavailable');
    return;
  }

  const server = baseSocket.server as typeof baseSocket.server & {
    wss?: WebSocketServer;
    __ws_initialized__?: boolean;
  };

  if (!server.__ws_initialized__) {
    const wss = new WebSocketServer({ noServer: true });

    const handleConnection = (websocket: WebSocket, request: IncomingMessage) => {
      const requestUrl = new URL(request.url ?? '', 'http://localhost');
      const segment = requestUrl.pathname.split('/').filter(Boolean).pop();
      const projectId = segment && segment !== 'ws' ? decodeURIComponent(segment) : null;

      if (!projectId) {
        websocket.close(1008, 'Project ID required');
        return;
      }

      websocketManager.addConnection(projectId, websocket as any);
    };

    wss.on('connection', handleConnection);

    // Next.js 15 owns the HTTP server's `upgrade` listener and ends the socket
    // when the path matches a Pages API route. /api/ws/[projectId] matches, so
    // a second listener never gets a live socket. Intercept first and skip
    // Next.js for this path; leave HMR and other upgrades untouched.
    const existingUpgradeListeners = server.listeners('upgrade').slice() as UpgradeListener[];
    server.removeAllListeners('upgrade');

    server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
      try {
        const upgradeUrl = new URL(request.url ?? '', 'http://localhost');

        if (isProjectWebSocketPath(upgradeUrl.pathname)) {
          wss.handleUpgrade(request, socket, head, (websocket: WebSocket) => {
            wss.emit('connection', websocket, request);
          });
          return;
        }

        if (proxyPreviewWebSocket(request, socket, head)) {
          return;
        }
      } catch (error) {
        console.error('[WS] Failed to handle project WebSocket upgrade:', error);
        try {
          socket.destroy();
        } catch {
          // Ignore socket destroy failures
        }
        return;
      }

      for (const listener of existingUpgradeListeners) {
        listener.call(server, request, socket, head);
      }
    });

    server.wss = wss;
    server.__ws_initialized__ = true;
    ensureHeartbeat();
  }

  // When the browser initiates the WebSocket handshake it sends an Upgrade request.
  // The actual upgrade is handled in the server.on('upgrade') listener above,
  // so we must not attempt to write a normal HTTP response here.
  if (req.headers.upgrade?.toLowerCase() === 'websocket') {
    return;
  }

  // This API route is only used to ensure the server is initialized.
  // Respond with a simple 200 so the client knows the endpoint exists.
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).json({ ok: true });
}
