
import { Server } from "http";
import WebSocket, {WebSocketServer} from "ws";

export let ProjectWebsocketServer: WebSocket.Server | null = null;

export let availableSockets: WebSocket[] = [];


export function setupWebSocketServer(expressServer: Server){

    ProjectWebsocketServer = new WebSocketServer({server: expressServer});

    ProjectWebsocketServer.on('connection', (socket) =>{

        availableSockets.push(socket);
    } )

}

function cleanupClosedSockets (){
    availableSockets = availableSockets.filter(socket => (socket.CLOSED || socket.CLOSING));
}

export function sendMessageToSubscribers(message: string){

    for(const client of availableSockets){
        if(client.OPEN){
            client.send(message);
        }
    }

    cleanupClosedSockets();
}


