// import { Server as HttpServer } from 'http';
// import { Server } from 'socket.io';
// import { fetchMarketPrices } from '../services/marketPriceService';

// export function initWebsocket(server: HttpServer) {
//   const io = new Server(server, {
//     cors: {
//       origin: '*', // tighten for production
//     },
//   });

//   io.on('connection', async (socket) => {
//     console.log('Client connected:', socket.id);

//     // Send current prices immediately
//     try {
//       const prices = await fetchMarketPrices();
//       socket.emit('prices:init', prices);
//     } catch (e) {
//       console.error('Failed to send initial prices', e);
//     }

//     // Allow client to subscribe to specific symbols later if needed
//     socket.on('subscribe:pair', (symbol: string) => {
//       socket.join(`pair:${symbol}`);
//     });

//     socket.on('disconnect', () => {
//       console.log('Client disconnected:', socket.id);
//     });
//   });

//   return io;
// }

import { fetchPrices, priceEvents } from "../services/marketPriceService";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { klineEvents } from "../services/marketPriceService";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function startSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("NO_AUTH_TOKEN"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.data.user = decoded;
      next();
    } catch (e) {
      console.log("❌ Invalid WebSocket token");
      return next(new Error("INVALID_TOKEN"));
    }
  });

  // On client connect
  io.on("connection", async (socket) => {
    console.log("✓ WebSocket Authenticated User:", socket.data.user.id);

    // Send initial market data
    const prices = await fetchPrices();
    socket.emit("prices:init", prices);

    // Optional: join the user's private room
    socket.join(`user:${socket.data.user.id}`);
  });

  // Broadcast global price updates
  priceEvents.on("priceUpdate", (data) => {
    io.emit("priceUpdate", data);
  });

  klineEvents.on("klineUpdate", (data) => {
    io.emit("klineUpdate", data);
  });

  return io;
}
