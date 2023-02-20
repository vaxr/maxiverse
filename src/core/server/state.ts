import MapServer from "@/core/server/map";
import {ServerSocket} from "@/core/server/socket";
import {Server as SocketIOServer} from "socket.io";

/**
 * One rare case where a singleton is appropriate: Keeping global server state
 */
export class ServerState {
    private static instance: ServerState

    public static getInstance(io: SocketIOServer): ServerState {
        if (!ServerState.instance) {
            ServerState.instance = new ServerState(io)
        }
        return ServerState.instance
    }

    mapServer: MapServer

    private constructor(io: SocketIOServer) {
        console.log("New Socket.io server ...");
        console.log("Creating map server ...")
        const serverSocket = new ServerSocket(io)
        this.mapServer = new MapServer(serverSocket)
        this.mapServer.init()
    }
}