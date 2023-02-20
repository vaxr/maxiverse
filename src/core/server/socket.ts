import {Message, ServerSocket as IServerSocket} from "@/core/model/protocol";
import {Server as SocketIOServer} from "socket.io";

export class ServerSocket implements IServerSocket {

    io: SocketIOServer

    constructor(io: SocketIOServer) {
        this.io = io;
    }

    broadcast(msg: Message): void {
        this.io.emit('message', msg)
    }
}
