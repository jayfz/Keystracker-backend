import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";

export let ProjectWebsocketServer: WebSocket.Server | null = null;

export let availableSockets: WebSocket[] = [];

export function setupWebSocketServer(expressServer: Server) {
  ProjectWebsocketServer = new WebSocketServer({ server: expressServer });

  ProjectWebsocketServer.on("connection", (socket) => {
    availableSockets.push(socket);
  });
}

function cleanupClosedSockets() {
  availableSockets = availableSockets.filter((socket) => socket.CLOSED || socket.CLOSING);
}

export type ServerStatus = Enqueued | Processing | Failed | Completed;

type Enqueued = {
  status: "Enqueued";
  message: string;
};

type Processing = {
  status: "Processing";
  message: string;
  progress: number;
};

type Failed = {
  status: "Failed";
  message: string;
};

type Completed = {
  status: "Completed";
  message: string;
};

export function sendMessageToSubscribers(message: ServerStatus) {
  for (const client of availableSockets) {
    if (client.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  cleanupClosedSockets();
}
