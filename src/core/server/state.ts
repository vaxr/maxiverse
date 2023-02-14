import MapServer from "@/core/server/map";

/**
 * One rare case where a singleton is appropriate: Keeping global server state
 */
export class ServerState {
    private static instance: ServerState

    public static getInstance(): ServerState {
        if (!ServerState.instance) {
            ServerState.instance = new ServerState()
        }
        return ServerState.instance
    }

    mapServer: MapServer

    private constructor() {
        console.log("Creating map server ...")
        this.mapServer = new MapServer()
        this.mapServer.init()
    }
}