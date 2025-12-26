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
