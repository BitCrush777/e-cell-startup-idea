// @ts-ignore
import openNextHandler from '../.open-next/worker.js';
import { RoomDurableObject } from './durable-object/Room';

export { RoomDurableObject };

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 1. WebSocket Upgrade and Real-Time Durable Object channels
    if (
      request.headers.get('Upgrade') === 'websocket' ||
      url.pathname.endsWith('/ws') ||
      url.pathname.includes('/ws?')
    ) {
      const roomMatch = url.pathname.match(/\/rooms\/([A-Za-z0-9-]+)/);
      if (roomMatch && env.ROOMS) {
        const roomCode = roomMatch[1].toUpperCase();
        const id = env.ROOMS.idFromName(roomCode);
        const stub = env.ROOMS.get(id);
        return stub.fetch(request);
      }
    }

    // 2. Delegate all Next.js Frontend pages, App Router SSR, Static Assets, and API route handlers to OpenNext
    return openNextHandler.fetch(request, env, ctx);
  },
};
